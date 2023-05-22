///////////////////////////////////////////////////////////////////////////////
// 3PP Imports
///////////////////////////////////////////////////////////////////////////////
import type { Request, Response, NextFunction } from "express";

///////////////////////////////////////////////////////////////////////////////
// Types and Interfaces
///////////////////////////////////////////////////////////////////////////////
export interface ISseMessage {
    type?: string,
    data: string,
}

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        export interface Response {
            sse: ( data: string|ISseMessage, autoFrame?: boolean ) => void;
        }
    }
}

///////////////////////////////////////////////////////////////////////////////
// Functions
///////////////////////////////////////////////////////////////////////////////
export function enableSse( req: Request, res: Response, next: NextFunction ) {
    req.socket.setKeepAlive( true );
    req.socket.setNoDelay( true );
    req.socket.setTimeout( 0 );

    res.set( {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no"
    } );

    if( "2.0" !== req.httpVersion ) {
        res.setHeader( "Connection", "keep-alive" );
    }

    res.status(200);

    // export a function to send server-side-events
    res.sse = ( data: string|ISseMessage, autoFrame?: boolean ) => {

        let toSend = "";
        if( "string" === typeof data ) {
            toSend = ( autoFrame ? `data: ${data}\n\n` : data );
        } else if( "object" === typeof data ) {
            toSend = ( data.type ? `event: ${data.type}\ndata: ${data.data}\n\n` : ( autoFrame ? `data: ${data.data}\n\n` : data.data ) );
        } else {
            throw new Error( `Expected to receive a string or object, but got ${typeof data}` );
        }

        res.write( toSend );

        // support running within the compression middleware
        if( ( res as any ).flush && toSend.match( /\n\n$/ ) ) {
            ( res as any ).flush();
        }
    };

    // write 2kB of padding (for IE) and a reconnection timeout
    // then use res.sse to send to the client
    res.write( ":" + Array(2049).join(" ") + "\n" );
    res.sse( "retry: 2000\n\n" );

    // keep the connection open by sending a comment
    const keepAlive = setInterval( () => {
        res.sse( ":keep-alive\n\n" );
    }, 20000 );

    // cleanup on close and finish
    res.on( "close", () => {
        clearInterval( keepAlive );
    });
    res.on( "finish", () => {
        clearInterval( keepAlive );
    });

    next();
}
