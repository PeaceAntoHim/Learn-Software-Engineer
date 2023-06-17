FROM denoland/deno:1.30.0

WORKDIR /app
COPY . ./
# COPY ../deno-tingtong-server-gateway ./

EXPOSE 5000

# Prefer not to run as root.
USER deno

RUN deno cache  ./src/helpers/deps.ts 

# Compile the app so that it doesn't need to be compiled at each start.
RUN deno cache server.ts

CMD ["run",  "--allow-env", "--allow-read", "--allow-net", "server.ts"]

