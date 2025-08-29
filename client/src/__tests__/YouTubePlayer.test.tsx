import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import YouTubePlayer from "@/components/YouTubePlayer";

describe("YouTubePlayer", () => {
  let playerInstance: any;

  beforeEach(() => {
    jest.useFakeTimers();
    playerInstance = null;
    (window as any).YT = {
      Player: function (_el: any, opts: any) {
        playerInstance = this;
        this.currentTime = 0;
        this.playbackRate = 1;
        this.getPlaybackRate = jest.fn(() => this.playbackRate);
        this.setPlaybackRate = jest.fn((r: number) => {
          this.playbackRate = r;
          opts.events.onPlaybackRateChange({ target: this });
        });
        this.playVideo = jest.fn(() => {
          opts.events.onStateChange({ data: 1 });
        });
        this.pauseVideo = jest.fn(() => {
          opts.events.onStateChange({ data: 2 });
        });
        this.getCurrentTime = jest.fn(() => this.currentTime);
        this.seekTo = jest.fn((t: number) => {
          this.currentTime = t;
        });
        opts.events.onReady({ target: this });
      },
      PlayerState: { PLAYING: 1, PAUSED: 2 },
    };
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("changes speed via control", () => {
    render(React.createElement(YouTubePlayer, { videoId: "abc" }));
    const select = screen.getByLabelText("speed");
    fireEvent.change(select, { target: { value: "1.5" } });
    expect(playerInstance.setPlaybackRate).toHaveBeenCalledWith(1.5);
    expect((select as HTMLSelectElement).value).toBe("1.5");
  });

  it("loops between points", () => {
    render(React.createElement(YouTubePlayer, { videoId: "abc" }));
    const setStart = screen.getByLabelText("set-start");
    const setEnd = screen.getByLabelText("set-end");

    fireEvent.click(setStart); // start at 0
    playerInstance.currentTime = 5;
    fireEvent.click(setEnd); // end at 5
    playerInstance.currentTime = 6;
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(playerInstance.seekTo).toHaveBeenCalledWith(0);
  });
});
