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
  Download,
  X,
  LoaderCircle,
  Trash2,
} from "lucide-react";

import { supabase } from "./supabaseClient";
import "./style.css";

function App() {
  const [mostrarFoto, setMostrarFoto] = useState(false);
  const [mostrarRecado, setMostrarRecado] = useState(false);

  const [nomeFoto, setNomeFoto] = useState("");
  const [legendaFoto, setLegendaFoto] = useState("");
  const [arquivoFoto, setArquivoFoto] = useState(null);

  const [nomeRecado, setNomeRecado] = useState("");
  const [recado, setRecado] = useState("");

  const [fotos, setFotos] = useState([]);
  const [recadosSalvos, setRecadosSalvos] = useState([]);

  const [carregando, setCarregando] = useState(true);
  const [enviandoFoto, setEnviandoFoto] = useState(false);
  const [enviandoRecado, setEnviandoRecado] = useState(false);

  const [apagandoFoto, setApagandoFoto] = useState(null);
  const [apagandoRecado, setApagandoRecado] = useState(null);

  const [fotoSelecionada, setFotoSelecionada] = useState(null);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    setCarregando(true);

    try {
      const [resultadoFotos, resultadoRecados] = await Promise.all([
        supabase
          .from("fotos")
          .select("*")
          .order("created_at", { ascending: false }),

        supabase
          .from("recados")
          .select("*")
          .order("created_at", { ascending: false }),
      ]);

      if (resultadoFotos.error) {
        throw resultadoFotos.error;
      }

      if (resultadoRecados.error) {
        throw resultadoRecados.error;
      }

      setFotos(resultadoFotos.data || []);
      setRecadosSalvos(resultadoRecados.data || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      alert(
        "Não foi possível carregar as fotos e os recados. Verifique a conexão com o Supabase."
      );
    } finally {
      setCarregando(false);
    }
  }

  function entrarNoAlbum() {
    const secao = document.getElementById("participacao");

    if (secao) {
      secao.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }

  function abrirFoto() {
    setMostrarFoto(true);
    setMostrarRecado(false);
  }

  function abrirRecado() {
    setMostrarRecado(true);
    setMostrarFoto(false);
  }

  function fecharFormularios() {
    setMostrarFoto(false);
    setMostrarRecado(false);
  }

  async function enviarFoto(event) {
    event.preventDefault();

    if (!nomeFoto.trim()) {
      alert("Digite seu nome.");
      return;
    }

    if (!arquivoFoto) {
      alert("Escolha uma foto para enviar.");
      return;
    }

    if (!arquivoFoto.type.startsWith("image/")) {
      alert("Escolha um arquivo de imagem válido.");
      return;
    }

    setEnviandoFoto(true);

    try {
      const extensao = arquivoFoto.name.includes(".")
        ? arquivoFoto.name.split(".").pop().toLowerCase()
        : "jpg";

      const nomeArquivo = `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}.${extensao}`;

      const { error: uploadError } = await supabase.storage
        .from("fotos")
        .upload(nomeArquivo, arquivoFoto, {
          contentType: arquivoFoto.type,
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from("fotos")
        .getPublicUrl(nomeArquivo);

      const imagemUrl = publicUrlData?.publicUrl;

      if (!imagemUrl) {
        throw new Error("Não foi possível obter a URL da imagem.");
      }

      const { data, error: insertError } = await supabase
        .from("fotos")
        .insert({
          nome: nomeFoto.trim(),
          legenda: legendaFoto.trim() || null,
          imagem_url: imagemUrl,
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      setFotos((fotosAtuais) => [data, ...fotosAtuais]);

      setNomeFoto("");
      setLegendaFoto("");
      setArquivoFoto(null);

      const inputArquivo = document.getElementById("arquivo-foto");

      if (inputArquivo) {
        inputArquivo.value = "";
      }

      setMostrarFoto(false);

      alert("Foto compartilhada com sucesso! ❤️");
    } catch (error) {
      console.error("Erro ao enviar foto:", error);

      alert(
        `Não foi possível enviar a foto.\n\n${
          error?.message || "Verifique as permissões do Supabase."
        }`
      );
    } finally {
      setEnviandoFoto(false);
    }
  }

  async function enviarRecado(event) {
    event.preventDefault();

    if (!nomeRecado.trim()) {
      alert("Digite seu nome.");
      return;
    }

    if (!recado.trim()) {
      alert("Escreva uma mensagem.");
      return;
    }

    setEnviandoRecado(true);

    try {
      const { data, error } = await supabase
        .from("recados")
        .insert({
          nome: nomeRecado.trim(),
          mensagem: recado.trim(),
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      setRecadosSalvos((recadosAtuais) => [data, ...recadosAtuais]);

      setNomeRecado("");
      setRecado("");
      setMostrarRecado(false);

      alert("Recado enviado com carinho! ❤️");
    } catch (error) {
      console.error("Erro ao enviar recado:", error);

      alert(
        `Não foi possível salvar o recado.\n\n${
          error?.message || "Verifique as permissões do Supabase."
        }`
      );
    } finally {
      setEnviandoRecado(false);
    }
  }

  function abrirFotoGrande(foto) {
    setFotoSelecionada(foto);
  }

  function fecharFotoGrande() {
    setFotoSelecionada(null);
  }

  async function salvarFoto(foto) {
    try {
      const resposta = await fetch(foto.imagem_url);

      if (!resposta.ok) {
        throw new Error("Não foi possível baixar a imagem.");
      }

      const blob = await resposta.blob();

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download = `foto-${foto.id}.jpg`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao salvar foto:", error);

      window.open(
        foto.imagem_url,
        "_blank",
        "noopener,noreferrer"
      );
    }
  }

  async function apagarFoto(foto) {
    const confirmar = window.confirm(
      "Tem certeza que deseja apagar esta foto?"
    );

    if (!confirmar) {
      return;
    }

    setApagandoFoto(foto.id);

    try {
      const marcador =
        "/storage/v1/object/public/fotos/";

      const indice = foto.imagem_url.indexOf(marcador);

      let caminhoArquivo = null;

      if (indice !== -1) {
        caminhoArquivo = foto.imagem_url.slice(
          indice + marcador.length
        );
      }

      if (caminhoArquivo) {
        const { error: storageError } = await supabase.storage
          .from("fotos")
          .remove([caminhoArquivo]);

        if (storageError) {
          console.warn(
            "Não foi possível apagar o arquivo do Storage:",
            storageError
          );
        }
      }

      const { error: deleteError } = await supabase
        .from("fotos")
        .delete()
        .eq("id", foto.id);

      if (deleteError) {
        throw deleteError;
      }

      setFotos((fotosAtuais) =>
        fotosAtuais.filter((item) => item.id !== foto.id)
      );

      if (fotoSelecionada?.id === foto.id) {
        setFotoSelecionada(null);
      }

      alert("Foto apagada com sucesso.");
    } catch (error) {
      console.error("Erro ao apagar foto:", error);

      alert(
        `Não foi possível apagar a foto.\n\n${
          error?.message || "Verifique as permissões do Supabase."
        }`
      );
    } finally {
      setApagandoFoto(null);
    }
  }

  async function apagarRecado(item) {
    const confirmar = window.confirm(
      "Tem certeza que deseja apagar este recado?"
    );

    if (!confirmar) {
      return;
    }

    setApagandoRecado(item.id);

    try {
      const { error } = await supabase
        .from("recados")
        .delete()
        .eq("id", item.id);

      if (error) {
        throw error;
      }

      setRecadosSalvos((recadosAtuais) =>
        recadosAtuais.filter((recadoAtual) => recadoAtual.id !== item.id)
      );

      alert("Recado apagado com sucesso.");
    } catch (error) {
      console.error("Erro ao apagar recado:", error);

      alert(
        `Não foi possível apagar o recado.\n\n${
          error?.message || "Verifique as permissões do Supabase."
        }`
      );
    } finally {
      setApagandoRecado(null);
    }
  }

  return (
    <main className="site">

      {/* =========================
          CAPA
      ========================== */}

      <section className="hero">
        <div className="hero-frame">
          <div className="hero-inner">

            <div className="hero-bg-decoration hero-bg-left"></div>
            <div className="hero-bg-decoration hero-bg-right"></div>

            <div className="top-ornament">
              <span></span>
              <Heart size={15} strokeWidth={1.3} />
              <span></span>
            </div>

            <p className="hero-label">
              UM CAPÍTULO DE AMOR
            </p>

            <img
              src="/logo-rl.png"
              alt="Rosangela e Lucas"
              className="hero-logo"
            />

            <div className="names-decoration">
              <span></span>
              <Heart size={13} strokeWidth={1.2} />
              <span></span>
            </div>

            <h1 className="hero-names">
              Rosangela &amp; Lucas
            </h1>

            <p className="hero-message">
              Que este espaço guarde para sempre os momentos,
              sorrisos e palavras de carinho compartilhados
              por todos que fazem parte da nossa história.
            </p>

            <button
              className="hero-button"
              onClick={entrarNoAlbum}
            >
              <Images size={17} strokeWidth={1.5} />
              <span>ENTRAR NO ÁLBUM</span>
            </button>

            <div className="hero-bottom-ornament">
              <span></span>
              <Heart size={11} strokeWidth={1.2} />
              <span></span>
            </div>

            <div className="hero-scroll">
              <ChevronDown size={18} />
            </div>

          </div>
        </div>
      </section>


      {/* =========================
          INTRODUÇÃO
      ========================== */}

      <section className="intro-section">
        <div className="tiny-ornament">
          <span></span>
          <Heart size={12} />
          <span></span>
        </div>

        <p className="section-label">
          NOSSO GRANDE DIA
        </p>

        <h2 className="section-heading">
          Um dia para guardar no coração
        </h2>

        <p className="intro-text">
          Este álbum foi criado para que cada pessoa querida
          possa fazer parte das nossas lembranças.
          Compartilhe uma foto, deixe uma mensagem e ajude
          a tornar este momento ainda mais especial.
        </p>
      </section>


      {/* =========================
          PARTICIPAÇÃO
      ========================== */}

      <section
        className="participation-section"
        id="participacao"
      >
        <div className="section-line">
          <span></span>
          <Heart size={13} />
          <span></span>
        </div>

        <h2 className="section-heading">
          Compartilhe esse momento
        </h2>

        <p className="intro-text">
          Sua presença já torna tudo mais bonito.
          Agora você também pode deixar sua lembrança
          registrada aqui.
        </p>

        <div className="participation-grid">

          <article className="participation-card">
            <div className="card-icon">
              <Camera size={27} strokeWidth={1.3} />
            </div>

            <h3>
              Compartilhar uma foto
            </h3>

            <p className="card-description">
              Registre aquele momento especial
              e compartilhe com todos.
            </p>

            <button
              className="outline-button"
              onClick={abrirFoto}
            >
              <Camera size={16} />
              Compartilhar foto
            </button>
          </article>


          <article className="participation-card">
            <div className="card-icon">
              <MessageCircleHeart
                size={27}
                strokeWidth={1.3}
              />
            </div>

            <h3>
              Deixar um recado
            </h3>

            <p className="card-description">
              Escreva uma mensagem para os noivos
              guardarem com carinho.
            </p>

            <button
              className="outline-button"
              onClick={abrirRecado}
            >
              <MessageCircleHeart size={16} />
              Deixar um recado
            </button>
          </article>

        </div>
      </section>


      {/* =========================
          FORMULÁRIO DE FOTO
      ========================== */}

      {mostrarFoto && (
        <section className="form-section">
          <div className="form-wrapper">

            <div className="form-header">
              <div className="form-icon">
                <Camera size={22} />
              </div>

              <div>
                <p className="section-label">
                  COMPARTILHE
                </p>

                <h2>
                  Uma foto para guardar
                </h2>
              </div>
            </div>

            <form onSubmit={enviarFoto}>

              <label htmlFor="nome-foto">
                Seu nome
              </label>

              <input
                id="nome-foto"
                type="text"
                value={nomeFoto}
                onChange={(event) =>
                  setNomeFoto(event.target.value)
                }
                placeholder="Como podemos te identificar?"
                maxLength={100}
              />

              <label htmlFor="arquivo-foto">
                Escolha sua foto
              </label>

              <label
                htmlFor="arquivo-foto"
                className="file-input"
              >
                <Upload size={19} />

                <span>
                  {arquivoFoto
                    ? arquivoFoto.name
                    : "Clique para escolher uma foto"}
                </span>

                <input
                  id="arquivo-foto"
                  type="file"
                  accept="image/*"
                  onChange={(event) =>
                    setArquivoFoto(
                      event.target.files?.[0] || null
                    )
                  }
                />
              </label>

              <label htmlFor="legenda-foto">
                Legenda
              </label>

              <textarea
                id="legenda-foto"
                value={legendaFoto}
                onChange={(event) =>
                  setLegendaFoto(event.target.value)
                }
                placeholder="Se quiser, escreva uma pequena legenda..."
                rows="4"
                maxLength={300}
              />

              <div className="form-actions">

                <button
                  type="button"
                  className="cancel-button"
                  onClick={fecharFormularios}
                  disabled={enviandoFoto}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={enviandoFoto}
                >
                  {enviandoFoto ? (
                    <>
                      <LoaderCircle
                        size={17}
                        className="loading-icon"
                      />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Upload size={17} />
                      Compartilhar foto
                    </>
                  )}
                </button>

              </div>

            </form>
          </div>
        </section>
      )}


      {/* =========================
          FORMULÁRIO DE RECADO
      ========================== */}

      {mostrarRecado && (
        <section className="form-section">
          <div className="form-wrapper">

            <div className="form-header">
              <div className="form-icon">
                <MessageCircleHeart size={22} />
              </div>

              <div>
                <p className="section-label">
                  COM CARINHO
                </p>

                <h2>
                  Deixe uma mensagem
                </h2>
              </div>
            </div>

            <form onSubmit={enviarRecado}>

              <label htmlFor="nome-recado">
                Seu nome
              </label>

              <input
                id="nome-recado"
                type="text"
                value={nomeRecado}
                onChange={(event) =>
                  setNomeRecado(event.target.value)
                }
                placeholder="Digite seu nome"
                maxLength={100}
              />

              <label htmlFor="recado">
                Sua mensagem
              </label>

              <textarea
                id="recado"
                value={recado}
                onChange={(event) =>
                  setRecado(event.target.value)
                }
                placeholder="Escreva uma mensagem para Rosangela e Lucas..."
                rows="6"
                maxLength={500}
              />

              <div className="form-actions">

                <button
                  type="button"
                  className="cancel-button"
                  onClick={fecharFormularios}
                  disabled={enviandoRecado}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={enviandoRecado}
                >
                  {enviandoRecado ? (
                    <>
                      <LoaderCircle
                        size={17}
                        className="loading-icon"
                      />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Send size={17} />
                      Enviar recado
                    </>
                  )}
                </button>

              </div>

            </form>
          </div>
        </section>
      )}


      {/* =========================
          ÁLBUM DE FOTOS
      ========================== */}

      <section className="gallery-section">

        <div className="section-line">
          <span></span>
          <Heart size={13} />
          <span></span>
        </div>

        <h2 className="section-heading">
          Nosso álbum
        </h2>

        <p className="intro-text">
          Cada foto compartilhada aqui passa a fazer
          parte da nossa história.
        </p>

        {carregando ? (
          <div className="loading-box">
            <LoaderCircle
              size={28}
              className="loading-icon"
            />

            <span>
              Carregando memórias...
            </span>
          </div>
        ) : fotos.length === 0 ? (
          <div className="gallery-placeholder">
            <Images size={34} strokeWidth={1.2} />

            <h3>
              Nosso álbum está esperando por você
            </h3>

            <p>
              Seja o primeiro a compartilhar uma foto
              desse dia tão especial.
            </p>

            <button
              className="outline-button"
              onClick={abrirFoto}
            >
              <Camera size={16} />
              Compartilhar foto
            </button>
          </div>
        ) : (
          <div className="gallery-grid">

            {fotos.map((foto, index) => (
              <article
                className={`gallery-card gallery-${
                  (index % 4) + 1
                }`}
                key={foto.id}
              >

                <button
                  className="gallery-image-button"
                  onClick={() =>
                    abrirFotoGrande(foto)
                  }
                  aria-label="Abrir foto"
                >
                  <img
                    src={foto.imagem_url}
                    alt={
                      foto.legenda ||
                      `Foto compartilhada por ${foto.nome}`
                    }
                    className="gallery-image"
                  />
                </button>

                <div className="gallery-info">

                  <div className="gallery-person">
                    <Heart
                      size={13}
                      fill="currentColor"
                    />
                  </div>

                  {foto.legenda && (
                    <p>
                      {foto.legenda}
                    </p>
                  )}

                  <div className="gallery-actions">

                    <button
                      type="button"
                      onClick={() =>
                        abrirFotoGrande(foto)
                      }
                    >
                      <Images size={14} />
                      Abrir
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        salvarFoto(foto)
                      }
                    >
                      <Download size={14} />
                      Salvar
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        apagarFoto(foto)
                      }
                      disabled={apagandoFoto === foto.id}
                      className="delete-button"
                    >
                      {apagandoFoto === foto.id ? (
                        <LoaderCircle
                          size={14}
                          className="loading-icon"
                        />
                      ) : (
                        <Trash2 size={14} />
                      )}

                      Apagar
                    </button>

                  </div>

                </div>
              </article>
            ))}

          </div>
        )}

      </section>


      {/* =========================
          RECADOS
      ========================== */}

      <section className="messages-section">

        <div className="section-line">
          <span></span>
          <MessageCircleHeart size={13} />
          <span></span>
        </div>

        <h2 className="section-heading">
          Recados para os noivos
        </h2>

        <p className="intro-text">
          Mensagens que ficarão guardadas como parte
          desse momento tão especial.
        </p>

        {carregando ? (
          <div className="loading-box">
            <LoaderCircle
              size={28}
              className="loading-icon"
            />

            <span>
              Carregando recados...
            </span>
          </div>
        ) : recadosSalvos.length === 0 ? (
          <div className="messages-empty">
            <MessageCircleHeart
              size={34}
              strokeWidth={1.2}
            />

            <h3>
              Ainda não há recados
            </h3>

            <p>
              Deixe uma mensagem para Rosangela e Lucas.
            </p>

            <button
              className="outline-button"
              onClick={abrirRecado}
            >
              <MessageCircleHeart size={16} />
              Deixar um recado
            </button>
          </div>
        ) : (
          <div className="messages-grid">

            {recadosSalvos.map((item) => (
              <article
                className="message-card"
                key={item.id}
              >

                <div className="message-top">
                  <div className="message-icon">
                    <Heart
                      size={17}
                      fill="currentColor"
                    />
                  </div>

                  <div>
                    <h3>
                      {item.nome}
                    </h3>

                    <span>
                      Com carinho
                    </span>
                  </div>
                </div>

                <p className="message-text">
                  “{item.mensagem}”
                </p>

                <div className="message-bottom">
                  <span></span>

                  <button
                    type="button"
                    onClick={() =>
                      apagarRecado(item)
                    }
                    disabled={
                      apagandoRecado === item.id
                    }
                    className="message-delete"
                  >
                    {apagandoRecado === item.id ? (
                      <LoaderCircle
                        size={13}
                        className="loading-icon"
                      />
                    ) : (
                      <Trash2 size={13} />
                    )}

                    Apagar
                  </button>
                </div>

              </article>
            ))}

          </div>
        )}

      </section>


      {/* =========================
          SEÇÃO FINAL
      ========================== */}

      <section className="final-section">

        <div className="final-leaf final-leaf-left">
          <Sparkles size={42} strokeWidth={0.7} />
        </div>

        <div className="final-leaf final-leaf-right">
          <Sparkles size={42} strokeWidth={0.7} />
        </div>

        <div className="final-content">

          <div className="final-ornament">
            <span></span>
            <Heart
              size={15}
              fill="currentColor"
              strokeWidth={1}
            />
            <span></span>
          </div>

          <p className="final-label">
            Com carinho
          </p>

          <p className="final-text">
            Obrigada por fazer parte deste momento
            e por deixar uma lembrança tão especial
            na nossa história.
          </p>

          <div className="final-logo">
            <img
              src="/logo-rl.png"
              alt="Logo Rosangela & Lucas"
            />
          </div>

          <p className="final-names">
            Rosangela &amp; Lucas
          </p>

          <div className="final-bottom-ornament">
            <span></span>
            <Heart size={12} />
            <span></span>
          </div>

        </div>
      </section>


      {/* =========================
          MODAL DA FOTO
      ========================== */}

      {fotoSelecionada && (
        <div
          className="photo-modal"
          onClick={fecharFotoGrande}
        >

          <div
            className="photo-modal-content"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <button
              type="button"
              className="modal-close"
              onClick={fecharFotoGrande}
              aria-label="Fechar"
            >
              <X size={22} />
            </button>

            <img
              src={fotoSelecionada.imagem_url}
              alt={
                fotoSelecionada.legenda ||
                `Foto de ${fotoSelecionada.nome}`
              }
              className="modal-image"
            />

            <div className="modal-info">

              <div>
                <strong>
                  {fotoSelecionada.nome}
                </strong>

                {fotoSelecionada.legenda && (
                  <p>
                    {fotoSelecionada.legenda}
                  </p>
                )}
              </div>

              <button
                type="button"
                className="primary-button"
                onClick={() =>
                  salvarFoto(fotoSelecionada)
                }
              >
                <Download size={17} />
                Salvar foto
              </button>

            </div>

          </div>

        </div>
      )}

    </main>
  );
}

export default App;