import axios from "axios";
import { API_CONFIG } from "../libs/constants";
import { getAccessToken } from "@/libs/helpers";

export const createLivestream = async ({
  title,
  description,
  text,
  link,
  thumbnail,
}: {
  title: string;
  description: string;
  text: string;
  link: string;
  thumbnail: string;
}) => {
  const token = getAccessToken();
  const { data } = await axios.post(
    `${API_CONFIG}/livestream`,
    { title, description, text, link, views: 1, thumbnail },
    {
      headers: {
        Authorization: "Bearer " + token,
      },
    }
  );
  return data;
};

export const endLivestream = async ({ roomId }: { roomId: string }) => {
  const token = getAccessToken();
  const { data } = await axios.delete(
    `${API_CONFIG}/livestream?roomId=${roomId}`,
    {
      headers: {
        Authorization: "Bearer " + token,
      },
    }
  );
  return data;
};

export const getLivestreamByRoomId = async (roomId: string) => {
  const { data } = await axios.get(`${API_CONFIG}/livestream?roomId=${roomId}`);
  return data;
};

export const getAllLivestreams = async (page: number, search: string) => {
  const { data } = await axios.get(
    `${API_CONFIG}/livestream/all?page=${page}&&search=${search}`
  );
  return data;
};

export const startRecording = async (roomId: string) => {
  const data = await axios.get(
    `${API_CONFIG}/livestream/startRecording?roomId=${roomId}`
  );
  return data;
};

export const stopRecording = async (roomId: string) => {
  const data = await axios.get(
    `${API_CONFIG}/livestream/stopRecording?roomId=${roomId}`
  );
  return data;
};

export const increaseViews = async (roomId: string) => {
  const token = getAccessToken();
  const data = await axios.put(
    `${API_CONFIG}/livestream/increaseViews?roomId=${roomId}`,
    {},
    {
      headers: {
        Authorization: "Bearer " + token,
      },
    }
  );
  return data;
};
