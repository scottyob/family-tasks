/* eslint-disable @next/next/no-html-link-for-pages */
/* eslint-disable @next/next/no-sync-scripts */
import { type AppType } from "next/app";

import { api } from "~/utils/api";

import "~/styles/globals.scss";
import "~/styles/reactBootstrapTypeahead.scss";
import "react-day-picker/dist/style.css";
import "react-tooltip/dist/react-tooltip.css";

import Head from "next/head";
import { vt323 } from "~/utils/fonts";
import React, { Fragment, type ReactNode, useEffect } from "react";
import { useRouter } from "next/router";

function WithLoginRedirect(props: { children: ReactNode }): JSX.Element | null {
  if (status == "unauthenticated") {
    return (
      <div className="flex flex-1 items-center justify-center self-center">
        <div>
          Please{" "}
          <a className="text-lg text-lime-500" href="/api/auth/signin">
            Login
          </a>
        </div>
      </div>
    );
  }
  if (status == "loading") {
    return <p>Loading...</p>;
  }

  return <Fragment>{props.children}</Fragment>;
}

const MyApp: AppType = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <>
      <style jsx global>{`
        html {
        }
        h1 {
          font-family: ${vt323.style.fontFamily};
          font-size: 2em;
        }
        h2 {
          font-family: ${vt323.style.fontFamily};
          font-size: 1.4em;
        }
        .vt323 {
          font-family: ${vt323.style.fontFamily};
        }
      `}</style>
      <Head>
        <title>Family Tasks</title>
        <meta name="description" content="Tasks for the family" />
        <meta name="theme-color" content="white" />
        <link rel="manifest" href="/manifest.json" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <link rel="icon" href="/favicon.ico" />
        {/* <meta name="apple-mobile-web-app-capable" content="yes"></meta> */}
      </Head>
      <main className="flex max-h-screen min-h-screen flex-col">
          <Component {...pageProps} />
      </main>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/flowbite/1.6.3/flowbite.min.js"></script>
    </>
  );
};

export default api.withTRPC(MyApp);
