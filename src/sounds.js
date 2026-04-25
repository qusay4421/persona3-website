import goIntoTab from './Persona 3 Reload SFX/go_into_tab.wav'
import goOutTab from './Persona 3 Reload SFX/go_out_tab.wav'
import itemNavigation from './Persona 3 Reload SFX/item_navigation.wav'
import volumeSfx from './Persona 3 Reload SFX/volume.wav'

import s0 from './Persona 3 Reload Music/キミの記憶 - Yumi Kawamura - Topic (192k).mp3'
import s1 from './Persona 3 Reload Music/Full Moon Full Life - Azumi Takahashi - Topic (192k).mp3'
import s2 from './Persona 3 Reload Music/やすらぎ -Reload- - Azumi Takahashi - Topic (192k).mp3'
import s3 from "./Persona 3 Reload Music/When The Moon's Reaching Out Stars -Reload- - Azumi Takahashi - Topic (192k).mp3"
import s4 from './Persona 3 Reload Music/Color Your Night - Lotus Juice - Topic (192k).mp3'
import s5 from './Persona 3 Reload Music/深層心理 -Reload- - Azumi Takahashi - Topic (192k).mp3'
import s6 from "./Persona 3 Reload Music/It's Going Down Now - Azumi Takahashi - Topic (192k).mp3"
import s7 from './Persona 3 Reload Music/Changing Seasons -Reload- - Azumi Takahashi - Topic (192k).mp3'

// ─── SFX Volume ───────────────────────────────────────────────────────────────

const SFX_VOL_KEY   = 'p3-sfx-volume'
const MUSIC_VOL_KEY = 'p3-music-volume'

let globalVolume = (() => {
  const saved = localStorage.getItem(SFX_VOL_KEY)
  return saved !== null ? parseFloat(saved) : 1
})()

let musicVolume = (() => {
  const saved = localStorage.getItem(MUSIC_VOL_KEY)
  return saved !== null ? parseFloat(saved) : 0.7
})()

const cache = {}

function play(src) {
  if (!cache[src]) cache[src] = new Audio(src)
  const audio = cache[src]
  audio.volume = globalVolume
  audio.currentTime = 0
  audio.play().catch(() => {})
}

export function getVolume()      { return Math.round(globalVolume * 10) }
export function getMusicVolume() { return Math.round(musicVolume * 10) }

export function setVolume(level) {
  globalVolume = Math.max(0, Math.min(10, level)) / 10
  localStorage.setItem(SFX_VOL_KEY, globalVolume)
}

export function setMusicVolume(level) {
  musicVolume = Math.max(0, Math.min(10, level)) / 10
  localStorage.setItem(MUSIC_VOL_KEY, musicVolume)
  if (mAudio) mAudio.volume = musicVolume
}

export const sounds = {
  goIntoTab:      () => play(goIntoTab),
  goOutTab:       () => play(goOutTab),
  itemNavigation: () => play(itemNavigation),
  volume:         () => play(volumeSfx),
}

// ─── Music Player ─────────────────────────────────────────────────────────────

export const SONGS = [
  { title: "キミの記憶",                          artist: "Yumi Kawamura",   src: s0 },
  { title: "Full Moon Full Life",                 artist: "Azumi Takahashi", src: s1 },
  { title: "やすらぎ -Reload-",                  artist: "Azumi Takahashi", src: s2 },
  { title: "When The Moon's Reaching Out Stars",  artist: "Azumi Takahashi", src: s3 },
  { title: "Color Your Night",                    artist: "Lotus Juice",     src: s4 },
  { title: "深層心理 -Reload-",                  artist: "Azumi Takahashi", src: s5 },
  { title: "It's Going Down Now",                 artist: "Azumi Takahashi", src: s6 },
  { title: "Changing Seasons -Reload-",           artist: "Azumi Takahashi", src: s7 },
]

let mAudio   = null
let mIdx     = 0
let mPlaying = false
let mShuffle = false
let mCb      = null

export function setMusicCallback(cb) { mCb = cb }
function mNotify() { if (mCb) mCb({ idx: mIdx, playing: mPlaying, shuffle: mShuffle }) }

function mLoad(idx) {
  if (mAudio) { mAudio.pause(); mAudio.onended = null }
  mIdx = ((idx % SONGS.length) + SONGS.length) % SONGS.length
  mAudio = new Audio(SONGS[mIdx].src)
  mAudio.volume = musicVolume
  mAudio.onended = () => {
    const next = mShuffle
      ? Math.floor(Math.random() * SONGS.length)
      : (mIdx + 1) % SONGS.length
    mLoadPlay(next)
  }
}

function mLoadPlay(idx) {
  mLoad(idx)
  mAudio.play().catch(() => {})
  mPlaying = true
  mNotify()
}

export function musicPlayPause() {
  if (!mAudio) { mLoadPlay(mIdx); return }
  if (mPlaying) { mAudio.pause(); mPlaying = false }
  else { mAudio.play().catch(() => {}); mPlaying = true }
  mNotify()
}

export function musicNext() {
  const next = mShuffle
    ? Math.floor(Math.random() * SONGS.length)
    : (mIdx + 1) % SONGS.length
  mLoadPlay(next)
}

export function musicPrev() {
  if (mAudio && mAudio.currentTime > 3) {
    mAudio.currentTime = 0
    if (!mPlaying) { mAudio.play().catch(() => {}); mPlaying = true; mNotify() }
  } else {
    mLoadPlay((mIdx - 1 + SONGS.length) % SONGS.length)
  }
}

export function musicSetTrack(idx) { mLoadPlay(idx) }

export function musicToggleShuffle() {
  mShuffle = !mShuffle
  mNotify()
}

export function getMusicState() {
  return { idx: mIdx, playing: mPlaying, shuffle: mShuffle }
}

export function getMusicProgress() {
  if (!mAudio || isNaN(mAudio.duration)) return { current: 0, duration: 0 }
  return { current: mAudio.currentTime, duration: mAudio.duration }
}

export function musicSeek(seconds) {
  if (!mAudio || !mAudio.duration) return
  mAudio.currentTime = Math.max(0, Math.min(mAudio.duration, seconds))
}
