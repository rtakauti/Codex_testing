FROM node:20-bookworm

ARG PLAYWRIGHT_VERSION=1.58.2

# Install the system packages needed by native Node modules and Playwright.
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        git \
        python3 \
        python3-venv \
        make \
        g++ \
    && npx -y playwright@${PLAYWRIGHT_VERSION} install --with-deps chromium \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /workspaces/poddata
