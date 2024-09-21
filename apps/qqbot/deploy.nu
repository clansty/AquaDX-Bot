cd ../..
docker build -t gitea.c5y.moe/clansty/maibot-qq -f qqbot.Dockerfile --push .
curl -X POST -vL https://portainer.c5y.moe/api/stacks/webhooks/10d9fea3-43d2-46c3-811a-e65293d4d0cb
