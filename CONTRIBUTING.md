## Contribution

If you'd like to contribute, be sure to write us first in the [Discord channel](https://discord.gg/8xfhEYa). Our team will be very happy to
help you with onboarding, finding the areas where you can help best, and of course getting technical help!

dstack consists of two components:

1) Server – the application backend, written in Kotlin and React (this GitHub repo)
2) Client – the client, written in Python ([dstack-py](https://github.com/dstackai/dstack-py) GitHub repo)

### Building the server from source

#### 1. Set up your environment

dstack is a Spring Boot application written in Kotlin, that bundles a pre-build React application written in JavaScript.
In order to run the entire server with both front-end and back-end together, one must build both React and Spring applications.

In order to build dstack locally, you'll need to have `Java`, `yarn`, and `npm`. Make sure you have them installed locally.

#### 2. Building React application

The code of the React application resides in the folder `website`. This application bundles using [microbundle](https://github.com/developit/microbundle)
the React component that resides in the `dstack-react` folder. The `website` React application consumes the `dstack-react` component by importing `@dstackai/dstack-react`.

Before you can build the `website` React application, you first have to build the `dstack-react` React component by running
the following command from the folder `dstack-react`:

```bash
$ yarn install && npm run-script build
```

Now, you can build the React application folder by running the following command from the `website`:

```bash
$ yarn install && npm run-script build
```

#### 3. Building Spring Boot application

Before building the Spring Boot application, you first have to copy the pre-built distributive of the React application
from `website/build` to `server-local-cli/src/main/resources/website`. This can be done by the following Gradle task:

```bash
$ ./gradlew copyWebsite
```

Now, that you've copied the front-end application, you can run the Spring Boot application the following way:

```bash
$ ./gradlew bootRun
```

When you do it, you'll see the following output:

```bash
To access the application, open this URL in the browser: http://localhost:8080/auth/verify?user=dstack&code=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx&next=/
```

That's it! You're all set.

### Building the client from source

The source code of the Python client is currently available in a separate [GitHub repo](https://github.com/dstackai/dstack-py).
