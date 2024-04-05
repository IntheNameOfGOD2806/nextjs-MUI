"use client";
import TrackComments from "@/components/Comments/Track.Comments";
import WaveTrack from "@/components/Music/WaveTrack";
import TrackContext, { ITrackContext } from "@/lib/TrackContext";
import { sendRequest } from "@/utils/api";
import { Container } from "@mui/material";
import Button from "@mui/material/Button";
import { useSession } from "next-auth/react";
import { useContext, useEffect, useState } from "react";
import { FaPlay } from "react-icons/fa";
import { GoHeart, GoHeartFill } from "react-icons/go";
import "./Detail.Track.scss";
const DetailTrack = ({ params }: { params: { slug: string } }) => {
  const { data: session } = useSession();
  // const searchParams = useSearchParams();
  const { slug } = params;
  const [currentTime, setCurrentTime] = useState<string>("");
  const [trackDuration, setTrackDuration] = useState<number>(0);
  // const search = searchParams.get("audio");
  const { track, setTrack } = useContext(TrackContext) as ITrackContext;
  const [state, setState] = useState(false);
  const [seekto, setSeekto] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  const increaseView = async () => {
    const res = await sendRequest<any>({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}api/v1/tracks/increase-view`,
      method: "POST",
      // headers: {
      //   Authorization: "Bearer " + session?.access_token, //the token is a variable which holds the token
      // },
      body: {
        trackId: slug.trim(),
      },
    });
    // console.log(res);
    if (res && res.data) {
      console.log("view plus 1");
    }
  };
  useEffect(() => {
    increaseView();
  }, []);
  // console.log(">>>>check track::", track);
  const handleLikeTrack = async (quantity: number) => {
    const res = await sendRequest<any>({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}api/v1/likes`,
      method: "POST",
      headers: {
        Authorization: "Bearer " + session?.access_token, //the token is a variable which holds the token
      },
      body: {
        track: track?._id as string,
        // 1 or -1 (like/dislike) track
        quantity: isLiked ? -1 : (1 as number),
      },
    });
    // console.log(res);
    if (res && res.data) {
      // re-render the component
      setIsLiked(!isLiked);
      fetchCount();
    }
  };
  const checkIsLiked = async () => {
    const res = await getTrackLikedByUser();

    if (
      res?.data.result
        .map(({ _id }: { _id: string }) => {
          return _id;
        })
        .includes(slug.trim() as string)
    ) {
      setIsLiked(true);
    }
  };
  const fetchCount = async () => {
    const res = await sendRequest<any>({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}api/v1/tracks/${slug.trim()}`,
      method: "GET",
      headers: {
        Authorization: "Bearer " + session?.access_token, //the token is a variable which holds the token
      },
    });
    // console.log(res);
    if (res && res.data) {
      setTrack({
        ...track,
        countLike: res.data.countLike,
        countPlay: res.data.countPlay,
      });
    }
    return res;
  };
  const getTrackLikedByUser = async () => {
    const res = await sendRequest<any>({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}api/v1/likes?current=1&pageSize=20`,
      method: "GET",
      headers: {
        Authorization: "Bearer " + session?.access_token, //the token is a variable which holds the token
      },
    });
    // console.log(res);
    if (res && res.data) {
    }
    return res;
  };
  useEffect(() => {
    checkIsLiked();
  }, []);
  return (
    <Container>
      <div className="track-banner-container">
        <div className="wavetrack-container">
          <WaveTrack
            seekto={seekto}
            state={state}
            setTrackDuration={setTrackDuration}
            setCurrentTime={setCurrentTime}
            trackId={slug}
          />
        </div>
        <div className="image-container">
          <img
            src={`${process.env.NEXT_PUBLIC_BACKEND_URL}images/${track?.imgUrl}`}
            alt=""
          />
        </div>
      </div>
      <div className="music-info ">
        <div>{track?.title}</div>
        <div className="author"> {track?.description}</div>
      </div>

      <section className="like-section">
        <div className="like-section-left">
          <div className="like-button">
            <Button
              onClick={() => handleLikeTrack(1)}
              color="secondary"
              sx={{
                minHeight: 0,
                minWidth: 0,
                padding: 0,
                height: "40px",
                width: "70px",
                borderRadius: "10px",
              }}
              variant="outlined"
            >
              {isLiked === false ? (
                <>
                  <GoHeart fontSize={20} />
                  <span style={{ marginLeft: "5px" }}>Like</span>
                </>
              ) : (
                <>
                  <GoHeartFill fontSize={20} />{" "}
                  <span style={{ marginLeft: "5px" }}>Liked</span>
                </>
              )}
            </Button>
          </div>
        </div>
        <div className="like-section-right">
          <div className="play-count">
            <FaPlay />
            <span>{track.countPlay}</span>
          </div>
          <div className="like-count">
            <GoHeartFill fontSize={18} /> <span>{track.countLike}</span>
          </div>
        </div>
      </section>

      <Container>
        <TrackComments
          setSeekto={setSeekto}
          setState={setState}
          currentTime={currentTime}
          trackDuration={trackDuration}
        />
      </Container>
    </Container>
  );
};
export default DetailTrack;