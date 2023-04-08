import { type AppType } from "next/app";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import 'react-tooltip/dist/react-tooltip.css'
import 'swiper/css';
import Head from "next/head";
import NavBar from "~/components/navbar";
import { vt323 } from "~/utils/fonts";
import React, { useEffect } from "react";
import { useAppStore } from "~/utils/context";
import { useRouter } from "next/router";
import { SessionProvider } from "next-auth/react"
import { TaskType } from "~/utils/enums";


const MyApp: AppType = ({ Component, pageProps }) => {
  // Global context
  const setFilters = useAppStore((state) => state.setFilters);

  const groupsQuery = api.users.groups.useQuery();

  // Pull all the information from the router
  const router = useRouter();
  const urlGroup = router.query['group']?.[0];
  const urlFilter = (router.query['filter'] as string | undefined ?? "Task") as TaskType;

  useEffect(() => {
    const groups = groupsQuery.data;
    if(groups == null) { return; }

    const group = urlGroup == null ? undefined : groups.find((g) => g.id == urlGroup);
    setFilters(urlFilter, group);

    // setGroup(urlGroup);
    // setFilterType(urlFilter);
  }, [router.query, groupsQuery.data])

  return (
    <SessionProvider>
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
        <link rel="icon" href="/favicon.ico" />
        {/* <meta name="apple-mobile-web-app-capable" content="yes"></meta> */}
      </Head>
        <main className="flex min-h-screen max-h-screen flex-col">
          <Component {...pageProps} />
          <div className="flex h-10 mb-5 p-1">
            <NavBar />
          </div>
        </main>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/flowbite/1.6.3/flowbite.min.js"></script>
    </SessionProvider>
  );
  // return <Component {...pageProps} />;
};

export default api.withTRPC(MyApp);
