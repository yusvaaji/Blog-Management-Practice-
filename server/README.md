# server

## Command

npx sequelize-cli model:generate --name User --attributes username:string,email:string,password:string,image:string

npx sequelize-cli model:generate --name Post --attributes title:string,body:string,search_vector:string,author:string,UserId:integer

npx sequelize-cli db:migrate

create Controller User dan Post

