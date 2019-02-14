//
// Created by anjomro on 05.02.19.
//

#ifndef SAANCO_WSSERVER_H

#include "wsserver.h"

#endif

struct fragment{
    char header[12];
    char buffer[4096];
    int hdrCount;
    int bufCount;
};




size_t unpack_uint32(const void *b, uint32_t *val) {
    uint32_t v32 = 0;
    memcpy (&v32, b, sizeof (uint32_t));
    *val = ntohl (v32);
    return sizeof (uint32_t);
}

size_t pack_uint32(void *buf, uint32_t val) {
    uint32_t v32 = htonl(val);
    memcpy(buf, &v32, sizeof(uint32_t));
    return sizeof(uint32_t);
}

void read_message(int fd, fd_set set) {
    static struct fragment buffered;
    int bytes = 0;
    uint32_t size = 0, listener = 0, type = 0;
    char hdr[PIPE_BUF] = { 0 }, buf[PIPE_BUF] = {0};
    char *ptr = NULL;

    FD_ZERO (&set);
    FD_SET (fd, &set);

    if ((select (fd + 1, &set, NULL, NULL, NULL)) < 1)
        exit (1);
    if (!FD_ISSET (fd, &set))
        return;

    if (hdr[0] == '\0') {
        if (read (fd, hdr, sizeof (uint32_t) * 3) < 1)
            return;
    }

    if (buffered.hdrCount > 0){
        char newHdr[4096];
        for (int i = 0; i < 12; ++i) {
            newHdr[i] = buffered.header[i];
        }


        if (hdr[4] != '\0' || hdr[5] != '\0') {
            for (int i = 0; i < 12; ++i) {
                if (hdr[i] == '\0'){
                    break;
                }
                else{
                    buffered.buffer[i] = hdr[i];
                    buffered.bufCount = i + 1;
                }
            }
        }
        memcpy(hdr, newHdr, 12 * sizeof(char));
        buffered.hdrCount = 0;
    }

    ptr = hdr;
    ptr += unpack_uint32(ptr, &listener);
    ptr += unpack_uint32(ptr, &type);
    ptr += unpack_uint32(ptr, &size);
    int x = read (fd, buf, size);



    if (buffered.bufCount > 0){
        char newBuf[4096];
        for (int i = 0; i < buffered.bufCount; ++i) {
            newBuf[i] = buffered.buffer[i];
        }
        for (int j = buffered.bufCount; j < 4096; ++j) {
            newBuf[j] = buf[j - buffered.bufCount];
        }
        memcpy(buf, newBuf, 4096 * sizeof(char));
        buffered.bufCount = 0;
    }

    if (type == 1 && size !=0 && buf[size - 1]=='\0'){
        if (hdr[4] == '\0' && hdr[5] == '\0') {
            // header probably valid
            int lastIndex = 11;
            while (hdr[lastIndex] == '\0') {
                lastIndex--;
            }
            memcpy(buffered.header, hdr, (lastIndex + 1) * sizeof(char));
            buffered.hdrCount = lastIndex;
        }

        if(buf[0] != '\0'){
            int lastIndex = 0;
            while (buf[lastIndex] != '\0') {
                lastIndex++;
            }
            char storeBuf[4096];
            for (int i = 0; i < buffered.bufCount; ++i) {
                storeBuf[i] = buffered.buffer[i];
            }
            for (int j = buffered.bufCount; j < buffered.bufCount + lastIndex + 1; ++j) {
                storeBuf[j] = buf[j - buffered.bufCount];
            }
            memcpy(buffered.buffer, buf, (buffered.bufCount + lastIndex + 1) * sizeof(char));
            buffered.bufCount += lastIndex;
        }

        printf("\n");
        return;
    }
    if (type == 8) {
        hasDisconnected(listener);
    } else if (type == 1) {
        gotMsg(listener, buf);
    }
    printf ("client: %d, type: %d, len: %d, msg: %s\n", listener, type, size, buf);
    //send_message(listener, 0x01, buf);

}

void send_message(unsigned int to, unsigned int type, const char *msg) {
    char *p = calloc (sizeof(uint32_t) * 3, sizeof(char)), *ptr;
    const char *fifo = "/tmp/wspipein.fifo";
    int fd;

    ptr = p;
    ptr += pack_uint32(ptr, to);
    ptr += pack_uint32(ptr, type);
    ptr += pack_uint32(ptr, (uint32_t) strlen(msg));

    fd = open(fifo, O_WRONLY);
    write(fd, p, sizeof(uint32_t) * 3);
    write(fd, msg, strlen(msg));
    close(fd);
    free (p);
}







int main(void) {
    fd_set set;
    char *fifo = "/tmp/wspipeout.fifo";
    int fd = 0;

    init();
    if ((fd = open (fifo, O_RDWR | O_NONBLOCK)) < 0)
        exit (1);
    while (1)
        read_message(fd, set);

    return 0;
}
