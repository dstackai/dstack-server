import tensorflow as tf
from sklearn.datasets import load_breast_cancer

from dstack import push, pull
from tests import TestBase


class TestTensorFlow(TestBase):
    def test_simple_logistic_regression(self):
        data = load_breast_cancer()
        # normally we would put all of our imports at the top
        # but this lets us tell a story
        from sklearn.model_selection import train_test_split

        # split the data into train and test sets
        # this lets us simulate how our model will perform in the future
        x_train, x_test, y_train, y_test = train_test_split(data.data, data.target, test_size=0.33)
        n, d = x_train.shape
        # Scale the data
        # you"ll learn why scaling is needed in a later course
        from sklearn.preprocessing import StandardScaler

        scaler = StandardScaler()
        x_train = scaler.fit_transform(x_train)
        x_test = scaler.transform(x_test)
        # Now all the fun Tensorflow stuff
        # Build the model

        model = tf.keras.models.Sequential([
            tf.keras.layers.Input(shape=(d,)),
            tf.keras.layers.Dense(1, activation="sigmoid")
        ])

        # Alternatively, you can do:
        # model = tf.keras.models.Sequential()
        # model.add(tf.keras.layers.Dense(1, input_shape=(d,), activation="sigmoid"))

        model.compile(optimizer="adam",
                      loss="binary_crossentropy",
                      metrics=["accuracy"])

        # Train the model
        r = model.fit(x_train, y_train, validation_data=(x_test, y_test), epochs=100)

        # Evaluate the model - evaluate() returns loss and accuracy
        print("Train score:", model.evaluate(x_train, y_train))
        print("Test score:", model.evaluate(x_test, y_test))
        push("my_tf_model", model, "My first TF model")
        model1 = pull("my_tf_model")
        self.assertTrue(isinstance(model1, tf.keras.models.Sequential))

