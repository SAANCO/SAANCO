cmake_minimum_required(VERSION 3.5)
project(SAANCO C)

set(CMAKE_C_STANDARD 11)

#add_executable(master src/master/entry.c src/master/entry.h src/master/main.c src/master/main.h src/master/wsClient.c src/master/wsClient.h src/master/masterLogic.c src/master/masterLogic.h)
#target_link_libraries(master "/usr/local/lib/libwebsockets.so")
find_package(Lua51 REQUIRED)

include_directories(/usr/local/include ${LUA_INCLUDE_DIR})

add_executable(server src/master/wsserver.c)
target_link_libraries(server /usr/local/lib/libjansson.so)
target_link_libraries(server /usr/local/lib/libLuaHashMap.so)
target_link_libraries(server ${LUA_LIBRARIES})
