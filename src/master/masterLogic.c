//
// Created by anjomro on 12.02.19.
//

#include "masterLogic.h"

#include <string.h>
#include <jansson.h>
#include <LuaHashMap.h>


LuaHashMap *pubKeys;
LuaHashMap *connections;
LuaHashMap *reverseConnections;
LuaHashMap *messages;


void gotMsg(int fromID, char *msg) {
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
            to = json_object_get(parsing, "receiver");
            if (!json_is_string(to)) {
                fprintf(stderr, "error: receiver is no str\n");
                json_decref(parsing);
                return;
            }
            if (LuaHashMap_ExistsKeyString(connections, json_string_value(to))) {
                printf("\nnew msg to user  %s sent to %d\n", json_string_value(to),
                       (int) LuaHashMap_GetValueIntegerForKeyString(connections, json_string_value(to)));
                send_message((unsigned int) LuaHashMap_GetValueIntegerForKeyString(connections, json_string_value(to)),
                             1, msg);
            } else {
                printf("\nnew msg to user  %s pinged back, no recipient ( from %d)\n", json_string_value(to), fromID);
                send_message((unsigned int) fromID, 1, msg);
            }

            break;


        case 2:
            //new user
            printf(" ");
            json_t *username, *pubKey;

            username = json_object_get(parsing, "username");
            if (!json_is_string(username)) {
                fprintf(stderr, "error: username is no str\n");
                json_decref(parsing);
                return;
            }
            pubKey = json_object_get(parsing, "pubkey");
            if (!json_is_string(pubKey)) {
                fprintf(stderr, "error: pubKey is no str\n");
                json_decref(parsing);
                return;
            }
            if (!LuaHashMap_ExistsKeyString(pubKeys, json_string_value(username))) {
                LuaHashMap_SetValueStringForKeyString(pubKeys, json_string_value(pubKey), json_string_value(username));
            } else {

                char *newResponse = NULL;
                json_t *msgBuilder = json_object();
                json_object_set_new(msgBuilder, "type", json_integer(502));
                json_object_set_new(msgBuilder, "pubkeyof", username);
                json_object_set_new(msgBuilder, "pubkey", json_string(
                        LuaHashMap_GetValueStringForKeyString(pubKeys, json_string_value(username))));
                newResponse = json_dumps(msgBuilder, 0);
                json_decref(msgBuilder);

                send_message((
                                     unsigned int) fromID, 1, newResponse);
            }

            //bonjour config done for new user
            if (!LuaHashMap_ExistsKeyString(connections, json_string_value(username))) {
                printf("\nnew user %s registered at %d\n", json_string_value(username), fromID);
                LuaHashMap_SetValueIntegerForKeyString(connections, fromID, json_string_value(username));
                LuaHashMap_SetValueStringForKeyInteger(reverseConnections, json_string_value(username), fromID);
            }

            break;


        case 3:
            //get pubKey
            username = json_object_get(parsing, "username");
            if (!json_is_string(username)) {
                fprintf(stderr, "error: username is no str\n");
                json_decref(parsing);
                return;
            }

            char *newMSG = NULL;
            json_t *msgBuilder = json_object();

            if (LuaHashMap_ExistsKeyString(pubKeys, json_string_value(username))) {
                json_object_set_new(msgBuilder, "type", json_integer(203));
                json_object_set_new(msgBuilder, "pubKey", json_string(
                        LuaHashMap_GetValueStringForKeyString(pubKeys, json_string_value(username))));
                json_object_set_new(msgBuilder, "pubKeyOf", username);
            } else {
                json_object_set_new(msgBuilder, "type", json_integer(403));
                json_object_set_new(msgBuilder, "pubKey", json_string("no"));
                json_object_set_new(msgBuilder, "pubKeyOf", username);
            }
            newMSG = json_dumps(msgBuilder, 0);
            json_decref(msgBuilder);
            send_message((unsigned int) fromID, 1, newMSG);
            break;


        case 4:
            //bonjour
            username = json_object_get(parsing, "username");
            if (!json_is_string(username)) {
                fprintf(stderr, "error: username is no str\n");
                json_decref(parsing);
                return;
            }
            if (!LuaHashMap_ExistsKeyString(connections, json_string_value(username))) {
                printf("\nnew user %s registered at %d\n", json_string_value(username), fromID);
                LuaHashMap_SetValueIntegerForKeyString(connections, fromID, json_string_value(username));
                LuaHashMap_SetValueStringForKeyInteger(reverseConnections, json_string_value(username), fromID);
            }
            break;
    }

}


void hasDisconnected(int number) {
    if (LuaHashMap_ExistsKeyInteger(reverseConnections, number)) {
        printf("\n %s has diconnected (from %d)\n", LuaHashMap_GetValueStringForKeyInteger(reverseConnections, number),
               number);
        LuaHashMap_RemoveKeyString(connections, LuaHashMap_GetValueStringForKeyInteger(reverseConnections, number));
        LuaHashMap_RemoveKeyInteger(reverseConnections, number);
    }
}


void loadKeys() {
    pubKeys = LuaHashMap_Create();
}


void init() {
    loadKeys();
    connections = LuaHashMap_Create();
    reverseConnections = LuaHashMap_Create();
}
