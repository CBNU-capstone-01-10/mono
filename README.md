# wangnooni account server

account management를 위한 서버입니다.

## fill environment variable 
.env.example 파일을 참고해 .env를 작성하세요

## install dependencies

    npm install

    yarn install

## push database schema
먼저, mysql이 install 되어있고 mysql 서버가 실행되고 있는지 확인해주세요

    yarn run db:push:dev

    yarn run db:push:test

## test

    // test all 
    yarn run test

    // unit test
    yarn run test:unit

    // integration test
    yarn run test:integration