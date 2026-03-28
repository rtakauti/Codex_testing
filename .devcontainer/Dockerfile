FROM node:20-bookworm

ARG PLAYWRIGHT_VERSION=1.58.2
ARG NPM_VERSION=11.12.1

# Install the system packages needed by native Node modules and Playwright.
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        git \
        python3 \
        python3-venv \
        make \
        g++ \
    && npm install -g npm@${NPM_VERSION} \
    && npx -y playwright@${PLAYWRIGHT_VERSION} install --with-deps chromium \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /workspaces/poddata/node_modules /home/node/.npm-global \
    && chown -R node:node /workspaces /home/node/.npm-global

ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
ENV PATH=/home/node/.npm-global/bin:$PATH

WORKDIR /workspaces/poddata
