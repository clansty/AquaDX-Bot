#!/bin/bash

chown -R 1000:1000 /app

exec gosu node node --enable-source-maps .
