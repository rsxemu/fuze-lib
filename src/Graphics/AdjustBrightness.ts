export default function adjustBrightness(rgb: number, intensity: number) {
    let r = (rgb >> 16) / 256;
    let g = (rgb >> 8 & 0xff) / 256;
    let b = (rgb & 0xff) / 256;
    r = Math.pow(r, intensity);
    g = Math.pow(g, intensity);
    b = Math.pow(b, intensity);
    return (Math.trunc(r * 256) << 16) + (Math.trunc(g * 256) << 8) + Math.trunc(b * 256);
}