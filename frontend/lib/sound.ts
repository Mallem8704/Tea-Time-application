/**
 * Web Audio API Sound Generator for Tea Time Cafe.
 * Generates synthetic bell & chime notifications without external mp3 files.
 */

class SoundManager {
    private ctx: AudioContext | null = null;

    private getContext(): AudioContext | null {
        if (typeof window === "undefined") return null;
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
            }
        }
        if (this.ctx && this.ctx.state === "suspended") {
            this.ctx.resume().catch(() => {});
        }
        return this.ctx;
    }

    /**
     * Play a bright, cheerful dual-tone chime when a new order arrives.
     */
    playNewOrderChime() {
        const ctx = this.getContext();
        if (!ctx) return;

        try {
            const now = ctx.currentTime;

            // Tone 1 (High bell E6 - 1318 Hz)
            const osc1 = ctx.createOscillator();
            const gain1 = ctx.createGain();
            osc1.type = "sine";
            osc1.frequency.setValueAtTime(1318.5, now);
            gain1.gain.setValueAtTime(0.3, now);
            gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

            osc1.connect(gain1);
            gain1.connect(ctx.destination);
            osc1.start(now);
            osc1.stop(now + 0.6);

            // Tone 2 (Higher bell G#6 - 1661 Hz)
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.type = "sine";
            osc2.frequency.setValueAtTime(1661.2, now + 0.12);
            gain2.gain.setValueAtTime(0.35, now + 0.12);
            gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            osc2.start(now + 0.12);
            osc2.stop(now + 0.8);
        } catch (e) {
            console.warn("Could not play audio chime", e);
        }
    }

    /**
     * Play an alert tone for waiter / service call.
     */
    playServiceCallAlert() {
        const ctx = this.getContext();
        if (!ctx) return;

        try {
            const now = ctx.currentTime;

            // Pulsing attention chime
            [0, 0.18].forEach((delay, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = "triangle";
                osc.frequency.setValueAtTime(idx === 0 ? 880 : 1174, now + delay);
                gain.gain.setValueAtTime(0.25, now + delay);
                gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.4);

                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now + delay);
                osc.stop(now + delay + 0.4);
            });
        } catch (e) {
            console.warn("Could not play service alert", e);
        }
    }
}

export const soundManager = new SoundManager();
