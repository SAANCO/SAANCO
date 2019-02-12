//
// Created by anjomro on 31.01.19.
//

#ifndef SAANCO_WSSERVER_H
#define SAANCO_WSSERVER_H

#include <stdio.h>
#include <stdlib.h>
#include <fcntl.h>
#include <limits.h>
#include <stdint.h>
#include <string.h>
#include <netinet/in.h>
#include <zconf.h>

static size_t unpack_uint32 (const void *b, uint32_t * val);
size_t pack_uint32(void* buf, uint32_t val);
static void send_message(unsigned int to, unsigned int type, const char *msg);
static void read_message (int fd, fd_set set);
int main (void);

#endif //SAANCO_WSSERVER_H
