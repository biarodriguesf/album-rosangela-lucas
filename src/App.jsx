import { useState } from "react";
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

function App() {
  const [mostrarFoto, setMostrarFoto] = useState(false);
  const [mostrarRecado, setMostrarRecado] = useState(false);

  const [nomeFoto, setNomeFoto] = useState("");
  const [legendaFoto, setLegendaFoto] = useState("");
  const [arquivoFoto, setArquivoFoto] = useState(null);

  const [nomeRecado, setNomeRecado] = useState("");
  const [recado, setRecado] = useState("");

  const [fotos, setFotos] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("album_fotos")) || [];
    } catch {
      return [];
    }
  });

  const [recadosSalvos, setRecadosSalvos] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("album_recados")) || [];
    } catch {
      return [];
    }
  });

  function entrarNoAlbum() {
    document.getElementById("album")?.scrollIntoView({
      behavior: "smooth",
    });
  }

  function enviarFoto(event) {
    event.preventDefault();

    if (!nomeFoto.trim() || !arquivoFoto) {
      alert("Preencha seu nome e escolha uma foto. ❤️");
      return;
    }

    const leitor = new FileReader();

    leitor.onload = () => {
      const novaFoto = {
        id: Date.now(),
        nome: nomeFoto.trim(),
        legenda: legendaFoto.trim(),
        imagem: leitor.result,
      };

      const novasFotos = [...fotos, novaFoto];
      setFotos(novasFotos);
      localStorage.setItem("album_fotos", JSON.stringify(novasFotos));

      alert("Sua foto foi recebida e já faz parte do álbum! ❤️");
      setNomeFoto("");
      setLegendaFoto("");
      setArquivoFoto(null);
      setMostrarFoto(false);
    };

    leitor.readAsDataURL(arquivoFoto);
  }

  function enviarRecado(event) {
    event.preventDefault();

    if (!nomeRecado.trim() || !recado.trim()) {
      alert("Preencha seu nome e escreva seu recado. ❤️");
      return;
    }

    const novoRecado = {
      id: Date.now(),
      nome: nomeRecado.trim(),
      mensagem: recado.trim(),
    };

    const novosRecados = [...recadosSalvos, novoRecado];
    setRecadosSalvos(novosRecados);
    localStorage.setItem("album_recados", JSON.stringify(novosRecados));

    alert("Seu recado foi recebido pelos noivos! ❤️");
    setNomeRecado("");
    setRecado("");
    setMostrarRecado(false);
  }

  function abrirFoto() {
    setMostrarFoto(true);
    setMostrarRecado(false);

    setTimeout(() => {
      document
        .getElementById("formulario-foto")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
    }, 100);
  }

  function abrirRecado() {
    setMostrarRecado(true);
    setMostrarFoto(false);

    setTimeout(() => {
      document
        .getElementById("formulario-recado")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
    }, 100);
  }

  return (
    <main className="site">

      {/* =========================
          CAPA
      ========================= */}

      <section className="hero">

        <div className="hero-bg-decoration hero-bg-left">
          <span></span>
          <span></span>
          <span></span>
        </div>

        <div className="hero-bg-decoration hero-bg-right">
          <span></span>
          <span></span>
          <span></span>
        </div>

        <div className="hero-frame">

          <div className="hero-inner">

            <div className="top-ornament">
              <span></span>
              <b>✦</b>
              <span></span>
            </div>

            <p className="hero-label">
              NOSSO GRANDE DIA
            </p>

            {/* LOGO */}
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
              Rosangela <em>&amp;</em> Lucas
            </h1>

            <p className="hero-message">
              Uma história de amor,
              <br />
              muitos momentos para guardar.
            </p>

            <button
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
              <ChevronDown
                size={18}
                strokeWidth={1}
              />
            </div>

          </div>

        </div>

      </section>


      {/* =========================
          INTRODUÇÃO
      ========================= */}

      <section
        className="intro-section"
        id="album"
      >

        <div className="tiny-ornament">
          ✦
        </div>

        <p className="section-label">
          BEM-VINDOS AO NOSSO ÁLBUM
        </p>

        <h2>
          Este dia também é seu
        </h2>

        <div className="section-line">
          <span></span>
          <b>♥</b>
          <span></span>
        </div>

        <p className="intro-text">
          O nosso casamento será ainda mais especial
          porque você faz parte da nossa história.
        </p>

        <p className="intro-text">
          Este espaço foi criado para reunir as lembranças
          desse dia tão especial. Compartilhe suas fotos,
          deixe seu recado e faça parte do nosso álbum.
        </p>

      </section>


      {/* =========================
          PARTICIPAÇÃO
      ========================= */}

      <section className="participation-section">

        <div className="section-heading">


          <h2>
            Vamos guardar esse momento?
          </h2>

          <p>
            Sua lembrança também faz parte da nossa história.
          </p>

        </div>


        <div className="participation-grid">

          <article className="participation-card">

            <div className="card-icon">
              <Camera
                size={28}
                strokeWidth={1.2}
              />
            </div>


            <h3>
              Compartilhe uma foto
            </h3>

            <p className="card-description">
              Tem uma foto especial desse dia?
              Envie para fazer parte do nosso álbum.
            </p>

            <button
              className="outline-button"
              onClick={abrirFoto}
            >
              <Upload size={16} />
              Enviar uma foto
            </button>

          </article>


          <article className="participation-card">

            <div className="card-icon">
              <MessageCircleHeart
                size={28}
                strokeWidth={1.2}
              />
            </div>


            <h3>
              Deixe um recado
            </h3>

            <p className="card-description">
              Escreva uma mensagem para Rosangela &amp;
              Lucas guardarem para sempre.
            </p>

            <button
              className="outline-button"
              onClick={abrirRecado}
            >
              <Send size={16} />
              Deixar um recado
            </button>

          </article>

        </div>


        {/* FORMULÁRIO DE FOTO */}

        {mostrarFoto && (
          <div
            className="form-wrapper"
            id="formulario-foto"
          >

            <div className="form-header">

              <div className="form-icon">
                <Camera
                  size={21}
                  strokeWidth={1.2}
                />
              </div>

              <div>
                <h3>
                  Compartilhe sua foto
                </h3>

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
                />
              </label>


              <label>
                Escolha uma foto

                <div className="file-input">

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) =>
                      setArquivoFoto(
                        event.target.files?.[0] || null
                      )
                    }
                  />

                  <Images
                    size={23}
                    strokeWidth={1.2}
                  />

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
                />
              </label>


              <div className="form-actions">

                <button
                  type="button"
                  className="cancel-button"
                  onClick={() =>
                    setMostrarFoto(false)
                  }
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="primary-button"
                >
                  <Send size={16} />
                  Enviar foto
                </button>

              </div>

            </form>

          </div>
        )}


        {/* FORMULÁRIO DE RECADO */}

        {mostrarRecado && (
          <div
            className="form-wrapper"
            id="formulario-recado"
          >

            <div className="form-header">

              <div className="form-icon">
                <MessageCircleHeart
                  size={21}
                  strokeWidth={1.2}
                />
              </div>

              <div>
                <h3>
                  Deixe seu recado
                </h3>

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
                />

              </label>


              <div className="form-actions">

                <button
                  type="button"
                  className="cancel-button"
                  onClick={() =>
                    setMostrarRecado(false)
                  }
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="primary-button"
                >
                  <Send size={16} />
                  Enviar recado
                </button>

              </div>

            </form>

          </div>
        )}

        {recadosSalvos.length > 0 && (
          <div className="saved-messages">
            <div className="saved-messages-heading">
              <MessageCircleHeart size={20} strokeWidth={1.2} />
              <div>
                <p className="section-label">RECADOS</p>
                <h3>Recados que recebemos</h3>
              </div>
            </div>

            <div className="saved-messages-list">
              {recadosSalvos.map((item) => (
                <article className="saved-message-card" key={item.id}>
                  <div className="saved-message-heart">♥</div>
                  <div>
                    <strong>{item.nome}</strong>
                    <p>{item.mensagem}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

      </section>


      {/* =========================
          GALERIA
      ========================= */}

      <section className="gallery-section">

        <div className="section-heading">


          <h2>
            Nosso álbum
          </h2>

          <p>
            Cada foto conta um pedacinho da nossa história.
          </p>

        </div>


        <div className="gallery-grid">

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

        </div>


        {fotos.length > 0 && (
          <div className="gallery-uploaded">
            {fotos.map((foto) => (
              <article className="gallery-card gallery-uploaded-card" key={foto.id}>
                <img
                  src={foto.imagem}
                  alt={`Foto enviada por ${foto.nome}`}
                />
                {(foto.nome || foto.legenda) && (
                  <div className="gallery-caption">
                    <strong>{foto.nome}</strong>
                    {foto.legenda && <span>{foto.legenda}</span>}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}

        <button
          className="gallery-button"
          onClick={abrirFoto}
        >
          <Camera size={17} />
          Quero compartilhar também
        </button>

      </section>


      {/* =========================
          FINAL VERDE
      ========================= */}

      <section className="final-section">

        <div className="final-leaf final-leaf-left">
          ♥
        </div>

        <div className="final-leaf final-leaf-right">
          ♥
        </div>

        <div className="final-content">

          <div className="final-ornament">
            ✦
          </div>

          <p className="final-label">
            COM CARINHO
          </p>

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
            Que possamos guardar para sempre
            os momentos vividos ao lado de
            pessoas tão especiais.
          </p>

          <div className="final-bottom-ornament">
            ♥
          </div>

        </div>

      </section>


      {/* =========================
          RODAPÉ
      ========================= */}

      <footer className="footer">

        <div className="footer-inner">

          <div className="footer-logo-box">
            <img
              src="/logo-rl.png"
              alt="Logo Rosangela e Lucas"
              className="footer-logo"
            />
          </div>

          <div className="footer-line">
            <span></span>
            <Heart size={12} />
            <span></span>
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