import { Config } from '@remotion/cli/config';

// Remotion's bundled headless Chrome hangs on this Mac after the folder move (macOS scanning);
// the installed Google Chrome works reliably. Override with REMOTION_BROWSER if needed.
Config.setBrowserExecutable(process.env.REMOTION_BROWSER ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome');
