# Tasking

Family tasks is a family oriented to-do list.  The intent is to reward members of a household for completing tasks with Coins!

Tasks can be recurring, assigned to a member.. It's just yet another to-do app!

# Deploying
I use docker.  The following role does the trick for me:

```
---
- name: Start the family tasks server
  docker_container:
    name: family_tasks
    image: scottyob/family-tasks
    pull: true
    state: started
    restart_policy: unless-stopped
    volumes:
      - "/docker/{{ inventory_hostname }}/tasks:/app/db"
    ports:
      - '3002:3000'
    env:
      DATABASE_URL: "file:./db/db.sqlite"
      GOOGLE_SECRET: "...."
      GOOGLE_ID: "...."
      SECRET: "...."
      NEXTAUTH_URL: https://tasks.home.scottyob.com/
```


## Post-deploy.  Setting up the database

The first time launching, you'll need to setup the database and have that generated.
```
$ sudo docker exec  -it family_tasks /bin/sh
/app $ ln -s /app/db ./node_modules/.prisma/client/db
/app $ npx prisma db push --schema ./node_modules/.prisma/client/schema.prisma --skip-generate
```


# Updating & pushing to docker cloud
```
$ docker build  -t scottyob/family-tasks --build-arg NEXT_PUBLIC_CLIENTVAR=clientvar .
$ docker push scottyob/family-tasks:latest
```

# Developer Notes
## Updating the database
1.  Update the schema under prisma/schema.prisma
```
npx prisma generate
npx prisma db push
``` 