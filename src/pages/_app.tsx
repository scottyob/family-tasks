/* eslint-disable @next/next/no-html-link-for-pages */
/* eslint-disable @next/next/no-sync-scripts */
import { type AppType } from "next/app";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import 'react-tooltip/dist/react-tooltip.css'
import 'swiper/css';
import Head from "next/head";
import NavBar from "~/components/navbar";
import { vt323 } from "~/utils/fonts";
import React, { Fragment, type ReactNode, useEffect } from "react";
import { useAppStore } from "~/utils/context";
import { useRouter } from "next/router";
import { SessionProvider } from "next-auth/react"
import { useSession } from "next-auth/react"
import { type Session } from "next-auth";


function WithLoginRedirect(props: {children: ReactNode}): JSX.Element | null {
  const { status } = useSession()

  if (status == "unauthenticated") {
    return <div className="flex self-center flex-1 justify-center items-center">
      <div>
        Please <a className="text-lime-500 text-lg" href="/api/auth/signin">Login</a>
      </div>
    </div>
  }
  if (status == "loading") {
    return <p>Loading...</p>
  }

  return <Fragment>{props.children}</Fragment>;
}

const MyApp: AppType<{ session: Session | null}> = ({ Component, pageProps: { session, ...pageProps} }) => {
  // Global context
  const setFilters = useAppStore((state) => state.setGroup);

  const groupsQuery = api.users.groups.useQuery();

  // Pull all the information from the router
  const router = useRouter();
  const urlGroup = router.query['group']?.[0];


  useEffect(() => {
    const groups = groupsQuery.data;
    if (groups == null) { return; }

    const group = urlGroup == null ? undefined : groups.find((g) => g.id == urlGroup);
    setFilters(group);

  }, [router.query, groupsQuery.data, urlGroup, setFilters])

  return (
    <SessionProvider session={session}>
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
        <link rel="manifest" href="/manifest.json" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
        <link rel="icon" href="/favicon.ico" />
        {/* <meta name="apple-mobile-web-app-capable" content="yes"></meta> */}
      </Head>
      <main className="flex min-h-screen max-h-screen flex-col">
        <WithLoginRedirect>
          <Component {...pageProps} />
          <div className="flex h-10 mb-5 p-1">
            <NavBar />
          </div>
        </WithLoginRedirect>
      </main>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/flowbite/1.6.3/flowbite.min.js"></script>
    </SessionProvider>
  );
  // return <Component {...pageProps} />;
};

export default api.withTRPC(MyApp);
