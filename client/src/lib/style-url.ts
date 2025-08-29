export interface StyleOptions {
  text: string;
  font: string;
  sc: string; // start color
  ec: string; // end color
  k: number; // kerning
}

export function styleToSearchParams(style: StyleOptions): string {
  const params = new URLSearchParams();
  params.set("text", style.text);
  params.set("font", style.font);
  params.set("sc", style.sc);
  params.set("ec", style.ec);
  params.set("k", style.k.toString());
  return params.toString();
}

export function styleFromSearchParams(params: URLSearchParams): StyleOptions {
  return {
    text: params.get("text") || "",
    font: params.get("font") || "Standard",
    sc: params.get("sc") || "#ff0000",
    ec: params.get("ec") || "#0000ff",
    k: parseInt(params.get("k") || "0", 10),
  };
}
