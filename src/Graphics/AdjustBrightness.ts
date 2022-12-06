export default function setGamma(rgb: number, gamma: number) {
    let r = (rgb >> 16) / 256;
    let g = (rgb >> 8 & 0xff) / 256;
    let b = (rgb & 0xff) / 256;
    r = Math.pow(r, gamma);
    g = Math.pow(g, gamma);
    b = Math.pow(b, gamma);
    // Math.trunc?
    return (Math.max(0, Math.min(Math.round(r * 255), 255)) << 16)
        + (Math.max(0, Math.min(Math.round(g * 255), 255)) << 8)
        + Math.max(0, Math.min(Math.round(b * 255), 255));
}