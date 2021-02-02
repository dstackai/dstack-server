FROM debian:stable-slim

ENV PIP_URL_PRIMARY=https://test.pypi.org/simple/
ENV PIP_URL_SECONDARY=https://pypi.org/simple/
ENV DSTACK_PIP_VERSION=0.6.2

ENV PYTHON_3_6_VERSION=3.6.12
ENV PYTHON_3_7_VERSION=3.7.9
ENV PYTHON_3_8_VERSION=3.8.6
ENV PYTHON_3_9_VERSION=3.9.1

ADD requirements.txt /

RUN uname -r \
  && cat /etc/os-release \
  && apt-get update \
  && DEBIAN_FRONTEND=noninteractive \
  && apt-get install -y curl git build-essential libbz2-dev libncurses5-dev libncursesw5-dev libreadline-dev \
    libsqlite3-dev libssl-dev llvm make tk-dev wget xz-utils zlib1g-dev

ENV LC_ALL=C.UTF-8
ENV LANG=C.UTF-8

RUN curl -L https://raw.githubusercontent.com/pyenv/pyenv-installer/master/bin/pyenv-installer | bash \
  && /root/.pyenv/bin/pyenv install ${PYTHON_3_9_VERSION} \
  && /root/.pyenv/versions/${PYTHON_3_9_VERSION}/bin/pip install --index-url ${PIP_URL_PRIMARY} --upgrade --no-cache-dir --extra-index-url=${PIP_URL_SECONDARY} dstack==${DSTACK_PIP_VERSION} \
  && /root/.pyenv/versions/${PYTHON_3_9_VERSION}/bin/pip install -r /requirements.txt \
  && /root/.pyenv/versions/${PYTHON_3_9_VERSION}/bin/dstack server update \
  && /root/.pyenv/bin/pyenv install ${PYTHON_3_8_VERSION} \
  && /root/.pyenv/versions/${PYTHON_3_8_VERSION}/bin/pip install --index-url ${PIP_URL_PRIMARY} --upgrade --no-cache-dir --extra-index-url=${PIP_URL_SECONDARY} dstack==${DSTACK_PIP_VERSION} \
  && /root/.pyenv/versions/${PYTHON_3_8_VERSION}/bin/pip install -r /requirements.txt \
  && /root/.pyenv/bin/pyenv install ${PYTHON_3_7_VERSION} \
  && /root/.pyenv/versions/${PYTHON_3_7_VERSION}/bin/pip install --index-url ${PIP_URL_PRIMARY} --upgrade --no-cache-dir --extra-index-url=${PIP_URL_SECONDARY} dstack==${DSTACK_PIP_VERSION} \
  && /root/.pyenv/versions/${PYTHON_3_7_VERSION}/bin/pip install -r /requirements.txt \
  && /root/.pyenv/bin/pyenv install ${PYTHON_3_6_VERSION} \
  && /root/.pyenv/versions/${PYTHON_3_6_VERSION}/bin/pip install --index-url ${PIP_URL_PRIMARY} --upgrade --no-cache-dir --extra-index-url=${PIP_URL_SECONDARY} dstack==${DSTACK_PIP_VERSION} \
  && /root/.pyenv/versions/${PYTHON_3_6_VERSION}/bin/pip install -r /requirements.txt \
  && echo /root/.dstack-installer/config.yaml \
  && cat /root/.dstack-installer/config.yaml

RUN rm -rf /root/.cache \
    && rm -rf /root/.dstack/cache \
    && find /root/ -type d -name __pycache__ -exec rm -r {} \+

ENTRYPOINT /root/.pyenv/versions/${PYTHON_3_9_VERSION}/bin/dstack server start --skip \
    --python "/root/.pyenv/versions/${PYTHON_3_9_VERSION}/bin/python" \
    --python "/root/.pyenv/versions/${PYTHON_3_8_VERSION}/bin/python" \
    --python "/root/.pyenv/versions/${PYTHON_3_7_VERSION}/bin/python" \
    --python "/root/.pyenv/versions/${PYTHON_3_6_VERSION}/bin/python"
