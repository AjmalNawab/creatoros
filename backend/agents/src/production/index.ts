// Production department: makes the master video once; platform agents adapt and publish it.
import { research } from './research';
import { script } from './script';
import { voice } from './voice';
import { storyboard } from './storyboard';
import { visuals } from './visuals';
import { video } from './video';
import { qa } from './qa';

export const PRODUCTION_AGENTS = [research, script, voice, storyboard, visuals, video, qa];
