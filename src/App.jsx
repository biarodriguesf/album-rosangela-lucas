import { useEffect, useState } from "react";
import {
  Heart,
  Camera,
  Images,
  MessageCircleHeart,
  Upload,
  Send,
  Users,
  Sparkles,
  ChevronDown,
} from "lucide-react";

import "./style.css";
import { supabase } from "./supabaseClient";

function App() {
  const [mostrarFoto, setMostrarFoto] = useState(false);
  const [mostrarRecado, setMostrarRecado] = useState(false);

  const [nomeFoto, setNomeFoto] = useState("");
  const [legendaFoto, setLegendaFoto] = useState("");
  const [arquivoFoto, setArquivoFoto] = useState(null);

  const [nomeRecado, setNomeRecado] = useState("");
  const [recado, setRecado] = useState("");

  const [fotos, setFotos] = useState([]);

  const [enviandoFoto, setEnviandoFoto] = useState(false);
  const [enviandoRecado, setEnviandoRecado] = useState(false);

  useEffect(() => {
    carregarFotos();
  }, []);

  async function carregarFotos() {
    const { data, error } = await supabase
      .from("fotos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao carregar fotos:", error);
      return;
    }

    setFotos(data || []);
  }

  function entrarNoAlbum() {
    document.getElementById("album")?.scrollIntoView({
      behavior: "smooth",
    });
  }

  function abrirFoto() {
    setMostrarFoto(true);
    setMostrarRecado(false);

    setTimeout(() => {
      document.getElementById("formulario-foto")?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 100);
  }

  function abrirRecado() {
    setMostrarRecado(true);
    setMostrarFoto(false);

    setTimeout(() => {
      document.getElementById("formulario-recado")?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 100);
  }

  function fecharFoto() {
    if (enviandoFoto) return;

    setMostrarFoto(false);
    setNomeFoto("");
    setLegendaFoto("");
    setArquivoFoto(null);
  }

  function fecharRecado() {
    if (enviandoRecado) return;

    setMostrarRecado(false);
    setNomeRecado("");
    setRecado("");
  }

  async function enviarFoto(event) {
    event.preventDefault();

    if (!nomeFoto.trim() || !arquivoFoto) {
      alert("Preencha seu nome e escolha uma foto. ❤️");
      return;
    }

    try {
      setEnviandoFoto(true);

      const extensao =
        arquivoFoto.name.split(".").pop()?.toLowerCase() || "jpg";

      const nomeArquivo =
        Date.now() +
        "-" +
        Math.random().toString(36).substring(2) +
        "." +
        extensao;

      const { error: uploadError } = await supabase.storage
        .from("fotos-casamento")
        .upload(nomeArquivo, arquivoFoto, {
          cacheControl: "3600",
          upsert: false,
          contentType: arquivoFoto.type,
        });

      if (uploadError) {
        console.error("Erro ao enviar foto:", uploadError);

        alert("Não foi possível enviar a foto. Tente novamente. ❤️");

        return;
      }

      const { data: urlData } = supabase.storage
        .from("fotos-casamento")
        .getPublicUrl(nomeArquivo);

      const imagemUrl = urlData?.publicUrl;

      if (!imagemUrl) {
        alert("Não foi possível gerar o endereço da foto. ❤️");
        return;
      }

      const { error: bancoError } = await supabase
        .from("fotos")
        .insert([
          {
            nome: nomeFoto.trim(),
            legenda: legendaFoto.trim() || null,
            imagem_url: imagemUrl,
          },
        ]);

      if (bancoError) {
        console.error("Erro ao salvar foto no banco:", bancoError);

        await supabase.storage
          .from("fotos-casamento")
          .remove([nomeArquivo]);

        alert("Não foi possível salvar a foto. Tente novamente. ❤️");

        return;
      }

      await carregarFotos();

      alert("Sua foto foi enviada e já faz parte do nosso álbum! ❤️");

      setNomeFoto("");
      setLegendaFoto("");
      setArquivoFoto(null);
      setMostrarFoto(false);
    } catch (error) {
      console.error("Erro inesperado ao enviar foto:", error);

      alert("Ocorreu um erro ao enviar sua foto. Tente novamente. ❤️");
    } finally {
      setEnviandoFoto(false);
    }
  }

  async function enviarRecado(event) {
    event.preventDefault();

    if (!nomeRecado.trim() || !recado.trim()) {
      alert("Preencha seu nome e escreva seu recado. ❤️");
      return;
    }

    try {
      setEnviandoRecado(true);

      const { error } = await supabase.from("recados").insert([
        {
          nome: nomeRecado.trim(),
          mensagem: recado.trim(),
        },
      ]);

      if (error) {
        console.error("Erro ao salvar recado:", error);

        alert("Não foi possível enviar seu recado. Tente novamente. ❤️");

        return;
      }

      alert("Seu recado foi recebido pelos noivos! ❤️");

      setNomeRecado("");
      setRecado("");
      setMostrarRecado(false);
    } catch (error) {
      console.error("Erro inesperado ao enviar recado:", error);

      alert("Ocorreu um erro ao enviar seu recado. Tente novamente. ❤️");
    } finally {
      setEnviandoRecado(false);
    }
  }

  return (
    <main className="site">
      {/* =====================================================
          CAPA
      ===================================================== */}

      <section className="hero">
        <div className="hero-frame">
          <div className="hero-inner">
            <div className="top-ornament">
              <span></span>
              <b>✦</b>
              <span></span>
            </div>

            <p className="hero-label">NOSSO GRANDE DIA</p>

            <div className="hero-logo">
              <img
                src="/logo-rl.png"
                alt="Logo Rosangela e Lucas"
              />
            </div>

            <div className="names-decoration">
              <span></span>
              <b>♥</b>
              <span></span>
            </div>

            <h1 className="hero-names">
              <span>Rosangela</span>
              <em>&amp;</em>
              <span>Lucas</span>
            </h1>

            <p className="hero-message">
              Uma história de amor,
              <br />
              muitos momentos para guardar.
            </p>

            <button
              type="button"
              className="hero-button"
              onClick={entrarNoAlbum}
            >
              <span>Entrar no álbum</span>
              <b>→</b>
            </button>

            <div className="hero-bottom-ornament">
              <span></span>
              <Heart size={13} />
              <span></span>
            </div>

            <div className="hero-scroll">
              <ChevronDown size={18} strokeWidth={1} />
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          INTRODUÇÃO
      ===================================================== */}

      <section className="intro-section" id="album">
        <div className="tiny-ornament">✦</div>

        <p className="section-label">BEM-VINDOS AO NOSSO ÁLBUM</p>

        <h2>Este dia também é seu</h2>

        <div className="section-line">
          <span></span>
          <b>♥</b>
          <span></span>
        </div>

        <p className="intro-text">
          O nosso casamento será ainda mais especial porque você faz
          parte da nossa história.
        </p>

        <p className="intro-text">
          Este espaço foi criado para reunir as lembranças desse dia
          tão especial. Compartilhe suas fotos, deixe seu recado e
          faça parte do nosso álbum.
        </p>
      </section>

      {/* =====================================================
          PARTICIPAÇÃO
      ===================================================== */}

      <section className="participation-section">
        <div className="section-heading">
          <p className="section-label">FAÇA PARTE</p>

          <h2>Vamos guardar esse momento?</h2>

          <p>
            Sua lembrança também faz parte da nossa história.
          </p>
        </div>

        <div className="participation-grid">
          {/* FOTO */}

          <article className="participation-card">
            <div className="card-icon">
              <Camera size={28} strokeWidth={1.2} />
            </div>

            <h3>Compartilhe uma foto</h3>

            <p className="card-description">
              Tem uma foto especial desse dia? Envie para fazer parte
              do nosso álbum.
            </p>

            <button
              type="button"
              className="outline-button"
              onClick={abrirFoto}
            >
              <Upload size={16} />
              Enviar uma foto
            </button>
          </article>

          {/* RECADO */}

          <article className="participation-card">
            <div className="card-icon">
              <MessageCircleHeart size={28} strokeWidth={1.2} />
            </div>

            <h3>Deixe um recado</h3>

            <p className="card-description">
              Escreva uma mensagem para Rosangela &amp; Lucas
              guardarem para sempre.
            </p>

            <button
              type="button"
              className="outline-button"
              onClick={abrirRecado}
            >
              <Send size={16} />
              Deixar um recado
            </button>
          </article>
        </div>

        {/* =====================================================
            FORMULÁRIO DE FOTO
        ===================================================== */}

        {mostrarFoto && (
          <div className="form-wrapper" id="formulario-foto">
            <div className="form-header">
              <div className="form-icon">
                <Camera size={21} strokeWidth={1.2} />
              </div>

              <div>
                <h3>Compartilhe sua foto</h3>

                <p>
                  Ela fará parte da nossa história.
                </p>
              </div>
            </div>

            <form onSubmit={enviarFoto}>
              <label>
                Seu nome

                <input
                  type="text"
                  placeholder="Digite seu nome"
                  value={nomeFoto}
                  onChange={(event) =>
                    setNomeFoto(event.target.value)
                  }
                  disabled={enviandoFoto}
                />
              </label>

              <label>
                Escolha uma foto

                <div className="file-input">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                      const arquivo =
                        event.target.files?.[0] || null;

                      setArquivoFoto(arquivo);
                    }}
                    disabled={enviandoFoto}
                  />

                  <Images size={23} strokeWidth={1.2} />

                  <span>
                    {arquivoFoto
                      ? arquivoFoto.name
                      : "Clique para escolher uma foto"}
                  </span>
                </div>
              </label>

              <label>
                Uma legenda, se quiser

                <input
                  type="text"
                  placeholder="Ex.: Um momento inesquecível ❤️"
                  value={legendaFoto}
                  onChange={(event) =>
                    setLegendaFoto(event.target.value)
                  }
                  disabled={enviandoFoto}
                />
              </label>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={fecharFoto}
                  disabled={enviandoFoto}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={enviandoFoto}
                >
                  <Send size={16} />

                  {enviandoFoto
                    ? "Enviando..."
                    : "Enviar foto"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* =====================================================
            FORMULÁRIO DE RECADO
        ===================================================== */}

        {mostrarRecado && (
          <div className="form-wrapper" id="formulario-recado">
            <div className="form-header">
              <div className="form-icon">
                <MessageCircleHeart
                  size={21}
                  strokeWidth={1.2}
                />
              </div>

              <div>
                <h3>Deixe seu recado</h3>

                <p>
                  Uma mensagem para os noivos.
                </p>
              </div>
            </div>

            <form onSubmit={enviarRecado}>
              <label>
                Seu nome

                <input
                  type="text"
                  placeholder="Digite seu nome"
                  value={nomeRecado}
                  onChange={(event) =>
                    setNomeRecado(event.target.value)
                  }
                  disabled={enviandoRecado}
                />
              </label>

              <label>
                Sua mensagem

                <textarea
                  rows="5"
                  placeholder="Escreva uma mensagem carinhosa..."
                  value={recado}
                  onChange={(event) =>
                    setRecado(event.target.value)
                  }
                  disabled={enviandoRecado}
                />
              </label>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={fecharRecado}
                  disabled={enviandoRecado}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={enviandoRecado}
                >
                  <Send size={16} />

                  {enviandoRecado
                    ? "Enviando..."
                    : "Enviar recado"}
                </button>
              </div>
            </form>
          </div>
        )}
      </section>

      {/* =====================================================
          GALERIA
      ===================================================== */}

      <section className="gallery-section">
        <div className="section-heading">
          <p className="section-label">MEMÓRIAS</p>

          <h2>Nosso álbum</h2>

          <p>
            Cada foto conta um pedacinho da nossa história.
          </p>
        </div>

        <div className="gallery-grid">
          {fotos.length > 0 ? (
            fotos.map((foto) => (
              <div className="gallery-card" key={foto.id}>
                <img
                  src={foto.imagem_url}
                  alt={
                    foto.legenda ||
                    `Foto enviada por ${foto.nome}`
                  }
                  className="gallery-photo"
                />
              </div>
            ))
          ) : (
            <>
              <div className="gallery-card gallery-one">
                <div className="gallery-placeholder">
                  <Heart size={25} />
                </div>
              </div>

              <div className="gallery-card gallery-two">
                <div className="gallery-placeholder">
                  <Sparkles size={25} />
                </div>
              </div>

              <div className="gallery-card gallery-three">
                <div className="gallery-placeholder">
                  <Users size={25} />
                </div>
              </div>

              <div className="gallery-card gallery-four">
                <div className="gallery-placeholder">
                  <Camera size={25} />
                </div>
              </div>
            </>
          )}
        </div>

        <button
          type="button"
          className="gallery-button"
          onClick={abrirFoto}
        >
          <Camera size={17} />
          Quero compartilhar também
        </button>
      </section>

      {/* =====================================================
          MENSAGEM FINAL
      ===================================================== */}

      <section className="final-section">
        <div className="final-leaf final-leaf-left">
          ♥
        </div>

        <div className="final-leaf final-leaf-right">
          ♥
        </div>

        <div className="final-content">
          <div className="final-ornament">✦</div>

          <p className="final-label">COM CARINHO</p>

          <h2>
            Obrigado por fazer parte
            <br />
            da nossa história.
          </h2>

          <div className="final-line">
            <span></span>
            <Heart size={13} />
            <span></span>
          </div>

          <p className="final-text">
            Que possamos guardar para sempre os momentos vividos
            ao lado de pessoas tão especiais.
          </p>

          <div className="final-bottom-ornament">
            ♥
          </div>
        </div>
      </section>

      {/* =====================================================
          RODAPÉ
      ===================================================== */}

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-logo-box">
            <img
              src="/logo-rl.png"
              alt="Logo Rosangela e Lucas"
              className="footer-logo"
            />
          </div>

          <p className="footer-title">
            Rosangela &amp; Lucas
          </p>

          <span className="footer-message">
            Com amor, para sempre.
          </span>
        </div>
      </footer>
    </main>
  );
}

export default App;