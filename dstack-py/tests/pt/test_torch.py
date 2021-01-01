import numpy as np
import torch
from torch.autograd import Variable

from dstack import push, pull
from tests import TestBase


class TestTorch(TestBase):
    def test_linear_regression_weights(self):
        # create dummy data for training
        x_values = [i for i in range(11)]
        x_train = np.array(x_values, dtype=np.float32)
        x_train = x_train.reshape(-1, 1)

        y_values = [2 * i + 1 for i in x_values]
        y_train = np.array(y_values, dtype=np.float32)
        y_train = y_train.reshape(-1, 1)

        class LinearRegression(torch.nn.Module):
            def __init__(self, input_size, output_size):
                super(LinearRegression, self).__init__()
                self.linear = torch.nn.Linear(input_size, output_size)

            def forward(self, x):
                out = self.linear(x)
                return out

        input_dim = 1  # takes variable 'x'
        output_dim = 1  # takes variable 'y'
        learning_rate = 0.01
        epochs = 100

        model = LinearRegression(input_dim, output_dim)
        criterion = torch.nn.MSELoss()
        optimizer = torch.optim.SGD(model.parameters(), lr=learning_rate)

        for epoch in range(epochs):
            # Converting inputs and labels to Variable
            if torch.cuda.is_available():
                inputs = Variable(torch.from_numpy(x_train).cuda())
                labels = Variable(torch.from_numpy(y_train).cuda())
            else:
                inputs = Variable(torch.from_numpy(x_train))
                labels = Variable(torch.from_numpy(y_train))

            # Clear gradient buffers because we don't want any gradient from previous epoch to carry forward,
            # don't want to cumulate gradients
            optimizer.zero_grad()

            # get output from the model, given the inputs
            outputs = model(inputs)

            # get loss for the predicted output
            loss = criterion(outputs, labels)
            print(loss)
            # get gradients w.r.t to parameters
            loss.backward()

            # update parameters
            optimizer.step()

            print('epoch {}, loss {}'.format(epoch, loss.item()))

        from dstack.torch.handlers import TorchModelEncoder
        TorchModelEncoder.STORE_WHOLE_MODEL = False
        push("my_torch_model", model, "My first PyTorch model")
        model1 = LinearRegression(input_dim, output_dim)
        from dstack.torch.handlers import TorchModelWeightsDecoder
        my_model: LinearRegression = pull("my_torch_model", decoder=TorchModelWeightsDecoder(model1))
        self.assertEqual(model1, my_model)
        self.assertEqual(model.state_dict(), my_model.state_dict())
