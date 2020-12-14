https://gist.github.com/pgilad/63ddb94e0691eebd502deee207ff62bd
https://www.akadia.com/services/ssh_test_certificate.html

https://blog.didierstevens.com/2015/03/30/howto-make-your-own-cert-with-openssl-on-windows/

프로젝트 추가
yarn run ts-node ./add_project.ts -prefix {prefix} -project {project}

    build_all.ts

    build.config.js

    package.json

    ./src/shim.d.ts

    ./src/index.tsx
    ./src/{PREFIX_project}

    ../digenglish_lib/{PREFIX_project}/student/import.html
    ../digenglish_lib/{PREFIX_project}/student/js/init.s.js

    ../digenglish_lib/{PREFIX_project}/teacher/import.html
    ../digenglish_lib/{PREFIX_project}/teacher/js/init.t.js

    {PREFIX_project}/student/index.html
    {PREFIX_project}/teacher/index.html

## prerequisite

node version 10.22.1

## install

- yarn install

- yarn upgrade

## build

- yarn run d_audio_english_s

- yarn run d_audio_english_t

- yarn run serve

## hot build

- yarn run hot_d_audio_english_t

## browser

http://localhost:8082/content/D_audio_english/teacher.html?kdmtdvlp=y

## 11/24

템플릿 명 변경

. D_word_english
. D_video_english
. D_audio_english
. D_reading_english

audio 공통

문제 한영 버튼 이미지 수정
정답 버튼 이미지 수정
종료 버튼 이미지 수정

T3(확인-보충) True False 스위치 기능 적용
(추가-기본) 정답 위치 수정

T7(딕테이션) 정답 기능 적용
T8(스크립트) 해석 팝업 추가
