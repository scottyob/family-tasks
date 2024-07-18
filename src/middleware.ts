
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { TaskwarriorLib } from 'taskwarrior-lib';
import { OwnersFromTwConfig } from './utils/taskLib';

export function middleware(request: NextRequest) {   
  const url = request.nextUrl.clone();

  if (url.pathname === '/') {
    url.pathname = '/Today'
    return NextResponse.redirect(url)   
  } 
}
