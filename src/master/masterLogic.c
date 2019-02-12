//
// Created by anjomro on 12.02.19.
//

#include "masterLogic.h"
#include "wsserver.h"
#include <string.h>
#include <jansson.h>

char pubKeys[4096][2][256];

void gotMsg(int fromID, char msg[4096]){
    json_t *parsing, *type, *from, *to;
    json_error_t error;
    parsing = json_loads(msg, 0, &error);

    if(!parsing)
    {
        fprintf(stderr, "error: on line %d: %s\n", error.line, error.text);
        return;
    }
    if(!json_is_object(parsing))
    {
        fprintf(stderr, "error: root is not an object\n");
        json_decref(parsing);
        return;
    }
    type = json_object_get(parsing, "type");
    if(!json_is_integer(type)){
        fprintf(stderr, "error: type is no int\n");
        json_decref(parsing);
        return;
    }
    json_int_t typeInt = json_integer_value(type);

    switch (typeInt){
        case 0:
            //Ping
            send_message((unsigned int) fromID, 1, msg);
            break;
        case 1:
            //normal message
            to = json_object_get(parsing, "to");
            if(!json_is_integer(type)){
                fprintf(stderr, "error: to is no int\n");
                json_decref(parsing);
                return;
            }
            send_message((
            unsigned int) json_integer_value(to), 1, msg);
            break;
        case 2:
            //new user
            json_t *username, *pubKey;

    }

}