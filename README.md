# wws Authorization server

- account management
- authentication 
- authorization

모두 이 서버가 수행합니다

## fill environment variable 
.env.example 파일을 참고해 .env를 작성하세요

## install dependencies

    npm install

    yarn install

## push database schema

    yarn run db:push:dev

    yarn run db:push:test

## test

    // test
    yarn run test

    // unit test
    yarn run test:unit  

    // integration test
    yarn run test:integration