import { useEffect, useState } from "react";

import {
  Heart,
  Camera,
  Images,
  MessageCircleHeart,
  Upload,
  Sparkles,
  ChevronDown,
  Download,
  X,
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

  const [browserId, setBrowserId] = useState(null);
  const [browserToken, setBrowserToken] = useState(null);

  const [enviandoFoto, setEnviandoFoto] = useState(false);
  const [enviandoRecado, setEnviandoRecado] = useState(false);

  const [apagandoFoto, setApagandoFoto] = useState(null);
  const [apagandoRecado, setApagandoRecado] = useState(null);

  const [fotoSelecionada, setFotoSelecionada] = useState(null);

  const [modalExclusao, setModalExclusao] = useState(null);
  const [modalMensagem, setModalMensagem] = useState(null);
  const [modalPublicacao, setModalPublicacao] = useState(null);

  useEffect(() => {
    inicializarNavegador();
  }, []);

  function gerarIdentificador() {
    if (
      typeof window !== "undefined" &&
      window.crypto &&
      typeof window.crypto.randomUUID === "function"
    ) {
      return window.crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}-${Math.random()
      .toString(36)
      .slice(2)}`;
  }

  function obterIdentidadeDoNavegador() {
    const chaveId = "album-rosangela-lucas-browser-id";
    const chaveToken = "album-rosangela-lucas-browser-token";

    let id = localStorage.getItem(chaveId);
    let token = localStorage.getItem(chaveToken);

    if (!id) {
      id = gerarIdentificador();
      localStorage.setItem(chaveId, id);
    }

    if (!token) {
      token = gerarIdentificador();
      localStorage.setItem(chaveToken, token);
    }

    return {
      id,
      token,
    };
  }

  async function inicializarNavegador() {
    try {
      const identidade = obterIdentidadeDoNavegador();

      setBrowserId(identidade.id);
      setBrowserToken(identidade.token);

      await carregarDados();
    } catch (error) {
      console.error("Erro ao inicializar navegador:", error);

      setModalMensagem({
        tipo: "erro",
        titulo: "Não foi possível acessar o álbum",
        mensagem:
          error?.message ||
          "Não foi possível preparar seu acesso ao álbum.",
      });

      setCarregando(false);
    }
  }

  async function buscarDados() {
    const resultadoFotos = await supabase
      .from("fotos")
      .select(
        "id, nome, legenda, imagem_url, created_at, browser_id"
      )
      .order("created_at", {
        ascending: false,
      });

    const resultadoRecados = await supabase
      .from("recados")
      .select(
        "id, nome, mensagem, created_at, browser_id"
      )
      .order("created_at", {
        ascending: false,
      });

    if (resultadoFotos.error) {
      throw resultadoFotos.error;
    }

    if (resultadoRecados.error) {
      throw resultadoRecados.error;
    }

    return {
      fotos: resultadoFotos.data || [],
      recados: resultadoRecados.data || [],
    };
  }

  async function carregarDados() {
    setCarregando(true);

    try {
      const dados = await buscarDados();

      setFotos(dados.fotos);
      setRecadosSalvos(dados.recados);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);

      setModalMensagem({
        tipo: "erro",
        titulo: "Não foi possível carregar",
        mensagem:
          "Não foi possível carregar as fotos e os recados. Verifique a conexão com o Supabase.",
      });
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
    if (mostrarFoto) {
      fecharFormularios();
      return;
    }

    setMostrarFoto(true);
    setMostrarRecado(false);

    setTimeout(() => {
      const formulario =
        document.getElementById("formulario-foto");

      if (formulario) {
        formulario.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 100);
  }

  function abrirRecado() {
    if (mostrarRecado) {
      fecharFormularios();
      return;
    }

    setMostrarFoto(false);
    setMostrarRecado(true);

    setTimeout(() => {
      const formulario =
        document.getElementById("formulario-recado");

      if (formulario) {
        formulario.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 100);
  }

  function fecharFormularios() {
    if (enviandoFoto || enviandoRecado) {
      return;
    }

    setMostrarFoto(false);
    setMostrarRecado(false);
  }

  function enviarFoto(event) {
    event.preventDefault();

    if (!nomeFoto.trim()) {
      setModalMensagem({
        tipo: "erro",
        titulo: "Preencha seu nome",
        mensagem:
          "Digite seu nome antes de compartilhar a foto.",
      });
      return;
    }

    if (!browserId || !browserToken) {
      setModalMensagem({
        tipo: "erro",
        titulo: "Aguarde um instante",
        mensagem:
          "Estamos preparando seu acesso ao álbum. Tente novamente em alguns segundos.",
      });
      return;
    }

    if (!arquivoFoto) {
      setModalMensagem({
        tipo: "erro",
        titulo: "Escolha uma foto",
        mensagem:
          "Selecione uma foto para compartilhar no álbum.",
      });
      return;
    }

    if (
      !arquivoFoto.type ||
      !arquivoFoto.type.startsWith("image/")
    ) {
      setModalMensagem({
        tipo: "erro",
        titulo: "Arquivo inválido",
        mensagem:
          "Escolha um arquivo de imagem válido.",
      });
      return;
    }

    setModalPublicacao({
      tipo: "foto",
    });
  }

  async function confirmarPublicacaoFoto() {
    if (enviandoFoto) {
      return;
    }

    setModalPublicacao(null);
    setEnviandoFoto(true);

    try {
      if (!arquivoFoto) {
        throw new Error("Nenhuma foto foi selecionada.");
      }

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
        throw new Error(
          "Não foi possível obter a URL da imagem."
        );
      }

      const { data: resultado, error } =
        await supabase.rpc("adicionar_foto", {
          p_nome: nomeFoto.trim(),
          p_legenda: legendaFoto.trim() || null,
          p_imagem_url: imagemUrl,
          p_browser_id: browserId,
          p_browser_token: browserToken,
        });

      if (error) {
        throw error;
      }

      const fotoNova = Array.isArray(resultado)
        ? resultado[0]
        : resultado;

      if (!fotoNova) {
        throw new Error(
          "A foto foi enviada, mas o álbum não retornou os dados da nova foto."
        );
      }

      setFotos((fotosAtuais) => [
        fotoNova,
        ...fotosAtuais,
      ]);

      setNomeFoto("");
      setLegendaFoto("");
      setArquivoFoto(null);

      const formulario =
        document.getElementById("formulario-foto");

      const form = formulario?.querySelector("form");

      if (form) {
        form.reset();
      }

      setMostrarFoto(false);

      setModalMensagem({
        tipo: "sucesso",
        titulo: "Foto compartilhada!",
        mensagem:
          "Sua foto foi adicionada ao álbum e agora faz parte dessa história.",
      });
    } catch (error) {
      console.error("Erro ao enviar foto:", error);

      setModalMensagem({
        tipo: "erro",
        titulo: "Não foi possível enviar",
        mensagem:
          error?.message ||
          "Não foi possível compartilhar sua foto. Tente novamente.",
      });
    } finally {
      setEnviandoFoto(false);
    }
  }

  function enviarRecado(event) {
    event.preventDefault();

    if (!nomeRecado.trim()) {
      setModalMensagem({
        tipo: "erro",
        titulo: "Preencha seu nome",
        mensagem:
          "Digite seu nome antes de enviar o recado.",
      });
      return;
    }

    if (!browserId || !browserToken) {
      setModalMensagem({
        tipo: "erro",
        titulo: "Aguarde um instante",
        mensagem:
          "Estamos preparando seu acesso ao álbum. Tente novamente em alguns segundos.",
      });
      return;
    }

    if (!recado.trim()) {
      setModalMensagem({
        tipo: "erro",
        titulo: "Escreva seu recado",
        mensagem:
          "Digite uma mensagem antes de enviar.",
      });
      return;
    }

    setModalPublicacao({
      tipo: "recado",
    });
  }

  async function confirmarPublicacaoRecado() {
    if (enviandoRecado) {
      return;
    }

    setModalPublicacao(null);
    setEnviandoRecado(true);

    try {
      const nome = nomeRecado.trim();
      const mensagem = recado.trim();

      const { data: resultado, error } =
        await supabase.rpc("adicionar_recado", {
          p_nome: nome,
          p_mensagem: mensagem,
          p_browser_id: browserId,
          p_browser_token: browserToken,
        });

      if (error) {
        throw error;
      }

      const recadoNovo = Array.isArray(resultado)
        ? resultado[0]
        : resultado;

      if (!recadoNovo) {
        throw new Error(
          "O recado foi enviado, mas não foi possível atualizar a lista."
        );
      }

      setRecadosSalvos((recadosAtuais) => [
        recadoNovo,
        ...recadosAtuais,
      ]);

      setNomeRecado("");
      setRecado("");
      setMostrarRecado(false);

      setModalMensagem({
        tipo: "sucesso",
        titulo: "Recado enviado!",
        mensagem:
          "Seu recado foi registrado e agora faz parte desse momento especial.",
      });
    } catch (error) {
      console.error("Erro ao enviar recado:", error);

      setModalMensagem({
        tipo: "erro",
        titulo: "Não foi possível enviar",
        mensagem:
          error?.message ||
          "Não foi possível enviar seu recado. Tente novamente.",
      });
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
        throw new Error(
          "Não foi possível baixar a imagem."
        );
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

  function apagarFoto(foto) {
    if (!browserId) {
      setModalMensagem({
        tipo: "erro",
        titulo: "Aguarde um instante",
        mensagem:
          "Estamos identificando este navegador. Tente novamente.",
      });
      return;
    }

    if (foto.browser_id !== browserId) {
      setModalMensagem({
        tipo: "erro",
        titulo: "Ação não permitida",
        mensagem:
          "Você só pode apagar as fotos que publicou neste navegador.",
      });
      return;
    }

    setModalExclusao({
      tipo: "foto",
      item: foto,
    });
  }

  function apagarRecado(item) {
    if (!browserId) {
      setModalMensagem({
        tipo: "erro",
        titulo: "Aguarde um instante",
        mensagem:
          "Estamos identificando este navegador. Tente novamente.",
      });
      return;
    }

    if (item.browser_id !== browserId) {
      setModalMensagem({
        tipo: "erro",
        titulo: "Ação não permitida",
        mensagem:
          "Você só pode apagar os recados que publicou neste navegador.",
      });
      return;
    }

    setModalExclusao({
      tipo: "recado",
      item,
    });
  }

  async function confirmarExclusaoFoto(foto) {
    if (
      !browserId ||
      !browserToken ||
      foto.browser_id !== browserId
    ) {
      setModalExclusao(null);

      setModalMensagem({
        tipo: "erro",
        titulo: "Ação não permitida",
        mensagem:
          "Você só pode apagar as fotos que publicou neste navegador.",
      });

      return;
    }

    if (apagandoFoto !== null) {
      return;
    }

    setModalExclusao(null);
    setApagandoFoto(foto.id);

    try {
      const { data: resultado, error } =
        await supabase.rpc("apagar_foto", {
          p_id: foto.id,
          p_browser_token: browserToken,
        });

      if (error) {
        throw error;
      }

      if (
        resultado === false ||
        resultado === null ||
        typeof resultado === "undefined"
      ) {
        throw new Error(
          "Esta foto não pode ser apagada por este navegador."
        );
      }

      setFotos((fotosAtuais) =>
        fotosAtuais.filter(
          (item) => item.id !== foto.id
        )
      );

      if (fotoSelecionada?.id === foto.id) {
        setFotoSelecionada(null);
      }

      setModalMensagem({
        tipo: "sucesso-exclusao",
        titulo: "Foto apagada!",
        mensagem:
          "A foto foi removida do álbum com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao apagar foto:", error);

      setModalMensagem({
        tipo: "erro",
        titulo: "Não foi possível apagar",
        mensagem:
          error?.message ||
          "Não foi possível remover a foto. Tente novamente.",
      });
    } finally {
      setApagandoFoto(null);
    }
  }

  async function confirmarExclusaoRecado(item) {
    if (
      !browserId ||
      !browserToken ||
      item.browser_id !== browserId
    ) {
      setModalExclusao(null);

      setModalMensagem({
        tipo: "erro",
        titulo: "Ação não permitida",
        mensagem:
          "Você só pode apagar os recados que publicou neste navegador.",
      });

      return;
    }

    if (apagandoRecado !== null) {
      return;
    }

    setModalExclusao(null);
    setApagandoRecado(item.id);

    try {
      const { data: resultado, error } =
        await supabase.rpc("apagar_recado", {
          p_id: item.id,
          p_browser_token: browserToken,
        });

      if (error) {
        throw error;
      }

      if (
        resultado === false ||
        resultado === null ||
        typeof resultado === "undefined"
      ) {
        throw new Error(
          "Este recado não pode ser apagado por este navegador."
        );
      }

      setRecadosSalvos((recadosAtuais) =>
        recadosAtuais.filter(
          (recadoAtual) =>
            recadoAtual.id !== item.id
        )
      );

      setModalMensagem({
        tipo: "sucesso-exclusao",
        titulo: "Recado apagado!",
        mensagem:
          "O recado foi removido do álbum com sucesso.",
      });
    } catch (error) {
      console.error(
        "Erro ao apagar recado:",
        error
      );

      setModalMensagem({
        tipo: "erro",
        titulo: "Não foi possível apagar",
        mensagem:
          error?.message ||
          "Não foi possível remover o recado. Tente novamente.",
      });
    } finally {
      setApagandoRecado(null);
    }
  }

  function fecharModalMensagem() {
    setModalMensagem(null);
  }

  if (carregando) {
    return (
      <main className="site">
        <div className="loading-box">
          <span
            className="loading-icon"
            aria-hidden="true"
          >
            ⟳
          </span>

          <span>Carregando memórias...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="site">
      <section className="hero">
        <div className="hero-frame">
          <div className="hero-inner">
            <div className="hero-bg-decoration hero-bg-left"></div>
            <div className="hero-bg-decoration hero-bg-right"></div>

            <div className="top-ornament">
              <span></span>

              <Heart
                size={15}
                strokeWidth={1.3}
              />

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

              <Heart
                size={13}
                strokeWidth={1.2}
              />

              <span></span>
            </div>

            <h1 className="hero-names">
              Rosangela &amp; Lucas
            </h1>

            <p className="hero-message">
              Que este espaço guarde para sempre os
              momentos, sorrisos e palavras de carinho
              compartilhados por todos que fazem parte
              da nossa história.
            </p>

            <button
              type="button"
              className="hero-button"
              onClick={entrarNoAlbum}
            >
              <Images
                size={17}
                strokeWidth={1.5}
              />

              <span>ENTRAR NO ÁLBUM</span>
            </button>

            <div className="hero-bottom-ornament">
              <span></span>

              <Heart
                size={11}
                strokeWidth={1.2}
              />

              <span></span>
            </div>

            <div className="hero-scroll">
              <ChevronDown size={18} />
            </div>
          </div>
        </div>
      </section>

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
          Este álbum foi criado para que cada pessoa
          querida possa fazer parte das nossas
          lembranças. Compartilhe uma foto, deixe
          uma mensagem e ajude a tornar este momento
          ainda mais especial.
        </p>
      </section>

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
              <Camera
                size={27}
                strokeWidth={1.3}
              />
            </div>

            <h3>Compartilhar uma foto</h3>

            <p className="card-description">
              Registre aquele momento especial
              e compartilhe com todos.
            </p>

            <button
              type="button"
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

            <h3>Deixar um recado</h3>

            <p className="card-description">
              Escreva uma mensagem para os noivos
              guardarem com carinho.
            </p>

            <button
              type="button"
              className="outline-button"
              onClick={abrirRecado}
            >
              <MessageCircleHeart size={16} />
              Deixar um recado
            </button>
          </article>
        </div>
      </section>

      {mostrarFoto && (
        <section
          className="form-section"
          id="formulario-foto"
        >
          <div className="form-wrapper">
            <div className="form-header">
              <div className="form-icon">
                <Camera size={22} />
              </div>

              <div>
                <p className="section-label">
                  COMPARTILHE
                </p>

                <h2>Uma foto para guardar</h2>
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
                disabled={enviandoFoto}
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
                  disabled={enviandoFoto}
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
                disabled={enviandoFoto}
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
                  {enviandoFoto && (
                    <span
                      className="button-status-icon button-status-loading"
                      aria-hidden="true"
                    >
                      ⟳
                    </span>
                  )}

                  <span>
                    {enviandoFoto
                      ? "Enviando..."
                      : "Compartilhar foto"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </section>
      )}

      {mostrarRecado && (
        <section
          className="form-section"
          id="formulario-recado"
        >
          <div className="form-wrapper">
            <div className="form-header">
              <div className="form-icon">
                <MessageCircleHeart size={22} />
              </div>

              <div>
                <p className="section-label">
                  COM CARINHO
                </p>

                <h2>Deixe uma mensagem</h2>
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
                disabled={enviandoRecado}
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
                disabled={enviandoRecado}
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
                  {enviandoRecado && (
                    <span
                      className="button-status-icon button-status-loading"
                      aria-hidden="true"
                    >
                      ⟳
                    </span>
                  )}

                  <span>
                    {enviandoRecado
                      ? "Salvando..."
                      : "Enviar recado"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </section>
      )}

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

        {fotos.length === 0 ? (
          <div className="gallery-placeholder">
            <Images
              size={34}
              strokeWidth={1.2}
            />

            <h3>
              Nosso álbum está esperando por você
            </h3>

            <p>
              Seja o primeiro a compartilhar uma foto
              desse dia tão especial.
            </p>

            <button
              type="button"
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
                  type="button"
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
                    <p>{foto.legenda}</p>
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

                    {browserId ===
                      foto.browser_id && (
                      <button
                        type="button"
                        onClick={() =>
                          apagarFoto(foto)
                        }
                        disabled={
                          apagandoFoto === foto.id
                        }
                        className="delete-button"
                      >
                        {apagandoFoto ===
                          foto.id && (
                          <span
                            className="delete-status-icon button-status-loading"
                            aria-hidden="true"
                          >
                            ⟳
                          </span>
                        )}

                        <span>Apagar</span>
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

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

        {recadosSalvos.length === 0 ? (
          <div className="messages-empty">
            <MessageCircleHeart
              size={34}
              strokeWidth={1.2}
            />

            <h3>Ainda não há recados</h3>

            <p>
              Deixe uma mensagem para Rosangela e Lucas.
            </p>

            <button
              type="button"
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
                    <h3>{item.nome}</h3>

                    <span>Com carinho</span>
                  </div>
                </div>

                <p className="message-text">
                  “{item.mensagem}”
                </p>

                <div className="message-bottom">
                  <span></span>

                  {browserId ===
                    item.browser_id && (
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
                      {apagandoRecado ===
                        item.id && (
                        <span
                          className="delete-status-icon button-status-loading"
                          aria-hidden="true"
                        >
                          ⟳
                        </span>
                      )}

                      <span>Apagar</span>
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="final-section">
        <div className="final-leaf final-leaf-left">
          <Sparkles
            size={42}
            strokeWidth={0.7}
          />
        </div>

        <div className="final-leaf final-leaf-right">
          <Sparkles
            size={42}
            strokeWidth={0.7}
          />
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

      {modalExclusao && (
        <div
          className="delete-modal"
          onClick={() => {
            if (
              apagandoFoto === null &&
              apagandoRecado === null
            ) {
              setModalExclusao(null);
            }
          }}
        >
          <div
            className="delete-modal-content"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              type="button"
              className="delete-modal-close"
              onClick={() =>
                setModalExclusao(null)
              }
              disabled={
                apagandoFoto !== null ||
                apagandoRecado !== null
              }
              aria-label="Fechar"
            >
              <X size={20} />
            </button>

            <div className="delete-modal-icon">
              <Trash2
                size={25}
                strokeWidth={1.4}
              />
            </div>

            <p className="section-label">
              CONFIRMAR EXCLUSÃO
            </p>

            <h2>
              Deseja apagar{" "}
              {modalExclusao.tipo === "foto"
                ? "esta foto"
                : "este recado"}
              ?
            </h2>

            <p className="delete-modal-text">
              Essa ação não poderá ser desfeita.
            </p>

            <div className="delete-modal-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={() =>
                  setModalExclusao(null)
                }
                disabled={
                  apagandoFoto !== null ||
                  apagandoRecado !== null
                }
              >
                Cancelar
              </button>

              <button
                type="button"
                className="delete-confirm-button"
                onClick={() => {
                  if (
                    modalExclusao.tipo === "foto"
                  ) {
                    confirmarExclusaoFoto(
                      modalExclusao.item
                    );
                  } else {
                    confirmarExclusaoRecado(
                      modalExclusao.item
                    );
                  }
                }}
                disabled={
                  apagandoFoto !== null ||
                  apagandoRecado !== null
                }
              >
                {(apagandoFoto !== null ||
                  apagandoRecado !== null) && (
                  <span
                    className="delete-confirm-icon button-status-loading"
                    aria-hidden="true"
                  >
                    ⟳
                  </span>
                )}

                <span>
                  {apagandoFoto !== null ||
                  apagandoRecado !== null
                    ? "Apagando..."
                    : "Apagar"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {modalPublicacao && (
        <div
          className="message-modal"
          onClick={() =>
            setModalPublicacao(null)
          }
        >
          <div
            className="message-modal-content"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              type="button"
              className="message-modal-close"
              onClick={() =>
                setModalPublicacao(null)
              }
              aria-label="Fechar"
            >
              <X size={19} />
            </button>

            <div className="message-modal-icon success">
              {modalPublicacao.tipo === "foto" ? (
                <Camera
                  size={25}
                  strokeWidth={1.5}
                />
              ) : (
                <MessageCircleHeart
                  size={25}
                  strokeWidth={1.5}
                />
              )}
            </div>

            <p className="section-label">
              {modalPublicacao.tipo === "foto"
                ? "COMPARTILHAR FOTO"
                : "ENVIAR RECADO"}
            </p>

            <h2>
              {modalPublicacao.tipo === "foto"
                ? "Compartilhar esta foto?"
                : "Enviar este recado?"}
            </h2>

            <p className="message-modal-text">
              {modalPublicacao.tipo === "foto"
                ? "Sua foto será adicionada ao álbum e poderá ser vista pelos convidados."
                : "Seu recado ficará registrado no álbum para os noivos guardarem com carinho."}
            </p>

            <div className="delete-modal-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={() =>
                  setModalPublicacao(null)
                }
              >
                Cancelar
              </button>

              <button
                type="button"
                className="message-modal-button"
                onClick={() => {
                  if (
                    modalPublicacao.tipo === "foto"
                  ) {
                    confirmarPublicacaoFoto();
                  } else {
                    confirmarPublicacaoRecado();
                  }
                }}
              >
                {modalPublicacao.tipo === "foto"
                  ? "COMPARTILHAR"
                  : "ENVIAR"}
              </button>
            </div>
          </div>
        </div>
      )}

      {modalMensagem && (
        <div
          className="message-modal"
          onClick={fecharModalMensagem}
        >
          <div
            className="message-modal-content"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              type="button"
              className="message-modal-close"
              onClick={fecharModalMensagem}
              aria-label="Fechar"
            >
              <X size={19} />
            </button>

            <div
              className={`message-modal-icon ${
                modalMensagem.tipo === "erro"
                  ? "error"
                  : "success"
              }`}
            >
              {modalMensagem.tipo === "erro" ? (
                <X
                  size={25}
                  strokeWidth={1.5}
                />
              ) : (
                <Heart
                  size={25}
                  strokeWidth={1.5}
                  fill="currentColor"
                />
              )}
            </div>

            <p className="section-label">
              {modalMensagem.tipo === "erro"
                ? "ATENÇÃO"
                : modalMensagem.tipo ===
                    "sucesso-exclusao"
                  ? "TUDO CERTO"
                  : "COM CARINHO"}
            </p>

            <h2>{modalMensagem.titulo}</h2>

            <p className="message-modal-text">
              {modalMensagem.mensagem}
            </p>

            <button
              type="button"
              className="message-modal-button"
              onClick={fecharModalMensagem}
            >
              FECHAR
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default App;