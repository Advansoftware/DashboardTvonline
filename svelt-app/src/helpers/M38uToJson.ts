  import axios from "axios";
  import type { Channel } from "./types";

  function getJsonList(list: string): Channel[] | string {
    let lista = list;
    if (!lista.includes("#EXTM3U")) {
      return "getJsonList error: this is not a IPTV list";
    }
    lista = lista + " SENYDE";
    lista = lista.split("#EXTINF").join("SENYDEEXTINF");
    lista = lista.split('",').join('"SCNLGME ');
    let channels: Channel[] = [];
    let lista_em_array = lista.match(/EXTINF([\S\s]*?)SENYDE/g);
    lista_em_array !== null &&
      lista_em_array.forEach((ch) => {
        let img: string | null = null;
        if (ch.match(/tvg-logo="([\S\s]*?)"/i)) {
          img = ch.match(/tvg-logo="([\S\s]*?)"/i)![1];
        }
        let nome = ch.match(/"SCNLGME([\S\s]*?)http/i)![1];
        nome = nome.replace("\r", "");
        nome = nome.replace("\n", "");
        let grupo: string | null = null;
        if (ch.match(/group-title="([\S\s]*?)"/i)) {
          grupo = ch.match(/group-title="([\S\s]*?)"/i)![1];
        }
        let link: string | null = null;
        if (ch.match(/https?:\/\/[^\s]+/gi).length == 1) {
          link = ch.match(/https?:\/\/[^\s]+/gi)![0];
        } else {
          link = ch.match(/https?:\/\/[^\s]+/gi)![1];
        }
        channels.push({
          name: nome,
          image: img,
          group: grupo,
          link: link,
        });
      });
    return channels;
  }
  export async function getJsonListFromUrlAsync(
    url: string
  ): Promise<Channel[] | string> {
    try {
      const data = await axios.request({
        method: "GET",
        url,
        maxRedirects: 1,
        timeout: 0,
      });
      if (data.status === 302) {
        // Faz uma nova requisição para o URL redirecionado
        const newData = await axios.request({
          method: "GET",
          url: data.request.responseURL,
          maxRedirects: 1,
          timeout: 0,
        });
        return getJsonList(newData.data);
      } else {
        return getJsonList(data.data);
      }
    } catch (e : any) {
      return e;
    }
  }
