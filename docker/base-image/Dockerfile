FROM python:3.8

ADD requirements.txt /

ENV PIP_URL_PRIMARY=https://test.pypi.org/simple/
ENV PIP_URL_SECONDARY=https://pypi.org/simple/
ENV DSTACK_PIP_VERSION=0.6dev22

RUN uname -r \
  && cat /etc/os-release \
  && python3 --version \
  && pip3 --version \
  && apt-get update \
  && apt-get install -y tzdata \
  && dpkg-reconfigure --frontend noninteractive tzdata \
  && apt-get install -y libssl-dev \
  && apt-get install -y libcurl4-openssl-dev \
  && apt-get install -y libxml2-dev \
  && pip3 install pyyaml \
  && pip3 install tqdm \
  && pip3 install requests \
  && pip3 install deprecation \
  && pip3 install -r /requirements.txt \
  && pip3 install --index-url ${PIP_URL_PRIMARY} --upgrade --no-cache-dir --extra-index-url=${PIP_URL_SECONDARY} dstack==${DSTACK_PIP_VERSION}  \
  && dstack server update \
  && cat /root/.dstack/config.yaml

ENV DSTACK_PORT=""

ENTRYPOINT dstack server start --port ${DSTACK_PORT:-8080}
