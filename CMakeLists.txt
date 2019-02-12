cmake_minimum_required(VERSION 3.13)
project(SAANCO C)

set(CMAKE_C_STANDARD 11)

#add_executable(master src/master/entry.c src/master/entry.h src/master/main.c src/master/main.h src/master/wsClient.c src/master/wsClient.h src/master/masterLogic.c src/master/masterLogic.h)
#target_link_libraries(master "/usr/local/lib/libwebsockets.so")

add_executable(server src/master/wsserver.c src/master/masterLogic.c src/master/wsserver.h src/master/masterLogic.h)