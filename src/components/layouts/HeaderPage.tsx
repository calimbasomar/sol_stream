"use client"; // This is a client component

import React, { useState, useEffect } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";

/// Icons
import { CiSearch } from "react-icons/ci";
import { RxHamburgerMenu } from "react-icons/rx";
import { MdHelpOutline, MdOutlineFeedback, MdLogout } from "react-icons/md";
import { TbUserEdit } from "react-icons/tb";
import { BsCameraVideo } from "react-icons/bs";

/// Built-in
import { useDebouncedCallback } from "use-debounce";
import { useWallet } from "@solana/wallet-adapter-react";

/// Custom
import { Dropdown, DropdownItem, AvatarComponent } from "../common";
import { useAuthContext } from "@/contexts/AuthContextProvider";
import { getAccessToken, setAccessToken } from "@/libs/helpers";
import { createAuthToken, verifyToken } from "@/services/auth";
import { User } from "@/libs/types";

/// Images
import logoPic from "@/assets/images/logo.png";

const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

export default function HeaderPage({
  setSiderVisible,
}: {
  setSiderVisible: (visible: boolean) => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { publicKey, disconnecting, signMessage, disconnect } = useWallet();
  const { user, setUser } = useAuthContext();
  const [loading, setLoading] = useState(false);

  const handleSearch = useDebouncedCallback((term) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("search", term);
      router.replace(`/?${params.toString()}`);
    } else {
      params.delete("search");
      router.replace(`/`);
    }
  }, 500);

  useEffect(() => {
    if (publicKey && signMessage) {
      (async function () {
        setLoading(true);
        try {
          let token: string | null = getAccessToken();
          let _user: User | null = null;

          if (!token) {
            token = await createAuthToken({
              signMessage: signMessage,
              publicKey,
            });
          }

          _user = await verifyToken(token);
          setUser(_user);

          if (_user === null) {
            router.push("/signup");
          }
        } catch (err) {
          setUser(null);
          disconnect();
        }
        setLoading(false);
      })();
    }
  }, [publicKey]);

  useEffect(() => {
    if (disconnecting) {
      setUser(null);
      setAccessToken(null);
    }
  }, [disconnecting]);

  return (
    <div className="flex justify-between items-center sticky bg-background h-[64px] top-0 px-4 md:px-8 z-10 border-b border-1 border-solid border-[#FFFFFF0D] rounded-b-[40px]">
      <div className="hover:cursor-pointer md:hidden">
        <RxHamburgerMenu
          size={30}
          onClick={() => {
            setSiderVisible(true);
          }}
        />
      </div>
      <Image
        src={logoPic}
        alt="Picture of the Logo"
        className="hidden md:block w-[120px] h-[28px]"
      />
      <div className="hidden lg:flex flex-row items-center p-2 gap-2 w-[320px] h-[40px] rounded-lg border border-1 border-solid border-[#FFFFFF0D]">
        <div className="text-grey-300">
          <CiSearch size={28} />
        </div>
        <input
          type="text"
          placeholder="Search"
          defaultValue={searchParams.get("search") || ""}
          onChange={(e) => {
            handleSearch(e.target.value);
          }}
          className="w-[260px] h-[40px] bg-transparent border-none focus:outline-none focus:[box-shadow:none] placeholder:text-grey-500 text-white"
        />
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <Dropdown
          trigger={
            <div className="bg-grey-900 w-[48px] h-[48px] rounded-full flex lg:hidden justify-center items-center hover:cursor-pointer">
              <CiSearch size={28} />
            </div>
          }
          right={false}
          isShow={false}
        >
          <DropdownItem>
            <div className="flex lg:hidden flex-row items-center p-[8px] mx-4 my-2 gap-[8px] w-[320px] h-[40px] rounded-lg border border-1 border-solid border-[#FFFFFF0D]">
              <input
                type="text"
                placeholder="Search"
                defaultValue={searchParams.get("search") || ""}
                onChange={(e) => {
                  handleSearch(e.target.value);
                }}
                className="w-full h-[40px] bg-transparent border-none focus:outline-none focus:[box-shadow:none] placeholder:text-grey-500 text-white"
              />
            </div>
          </DropdownItem>
        </Dropdown>
        <WalletMultiButtonDynamic>
          {!publicKey && "Connect Wallet"}
        </WalletMultiButtonDynamic>

        {user !== null ? (
          <Dropdown
            trigger={
              <div className="relative min-w-[44px] w-[44px] h-[44px] rounded-full hover:cursor-pointer">
                <AvatarComponent avatar={user?.avatar} size={44} />
              </div>
            }
          >
            <DropdownItem>
              <div className="flex gap-2 px-4 py-2 border-b border-1 border-solid border-[#FFFFFF0D]">
                <AvatarComponent avatar={user?.avatar} size={44} />
                <div>
                  <div className="text-white text-[0.8em]">
                    {user?.firstname + " " + user?.lastname}
                  </div>
                  <div className="text-white text-[0.75em]">
                    @{user?.username}
                  </div>
                </div>
              </div>
            </DropdownItem>
            <DropdownItem>
              <div
                className="flex gap-2 px-4 py-2 mx-4 items-center w-full rounded-lg hover:bg-[#FFFFFF0A]"
                onClick={() => {
                  router.push("/profile");
                }}
              >
                <TbUserEdit size={20} />
                Edit Profile
              </div>
            </DropdownItem>
            <DropdownItem>
              <div
                className="flex gap-2 px-4 py-2 mx-4 items-center w-full rounded-lg hover:bg-[#FFFFFF0A]"
                onClick={() => {
                  router.push("/my-content");
                }}
              >
                <BsCameraVideo size={18} />
                My Content
              </div>
            </DropdownItem>
            <DropdownItem>
              <div
                className="flex gap-2 px-4 py-2 mx-4 items-center w-full rounded-lg hover:bg-[#FFFFFF0A]"
                onClick={() => {
                  window.open("https://t.me/SolMediaTech", "_blank");
                }}
              >
                <MdHelpOutline size={20} />
                Help
              </div>
            </DropdownItem>
            <DropdownItem>
              <div
                className="flex gap-2 px-4 py-2 mx-4 items-center w-full rounded-lg hover:bg-[#FFFFFF0A]"
                onClick={() => {
                  // setFeedback(true);
                }}
              >
                <MdOutlineFeedback size={20} />
                Send Feedback
              </div>
            </DropdownItem>
            <DropdownItem>
              <div
                className="flex gap-2 px-4 py-2 mx-4 items-center w-full rounded-lg hover:bg-[#FFFFFF0A]"
                onClick={disconnect}
              >
                <MdLogout size={20} />
                Log Out
              </div>
            </DropdownItem>
          </Dropdown>
        ) : (
          <div className="relative min-w-[44px] w-[44px] h-[44px] rounded-full hover:cursor-pointer">
            <AvatarComponent avatar="" size={44} />
          </div>
        )}
      </div>
    </div>
  );
}
