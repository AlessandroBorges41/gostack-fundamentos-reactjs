import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

import filesize from 'filesize';

import Header from '../../components/Header';
import FileList from '../../components/FileList';
import Upload from '../../components/Upload';

import { Container, Title, ImportFileContainer, Footer } from './styles';

import alert from '../../assets/alert.svg';
import api from '../../services/api';

interface FileProps {
  file: File;
  name: string;
  readableSize: string;
}

const Import: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<FileProps[]>([]);
  const history = useHistory();

  async function handleUpload(): Promise<void> {
    const data = new FormData();
    /* Se o valor do uploadedFiles for vazio ele retorna se realizar nenhum procedimento */
    if(!uploadedFiles.length) return;
    /* No caso desta aplicação será apenas enviado um arquivo por vez, nosso backend está usando o multer
       em single mode e nosso tratamento for feito para um arquivos por vez
    */
    const arquivo = uploadedFiles[0];

    data.append('file', arquivo.file, arquivo.name );

    try {
      await api.post('/transactions/import', data);
      history.push('/');
    } catch (err) {
       console.log(err.response.error);
    }
  }

  function submitFile(files: File[]): void {
    /* - Recuperando os arquivos que foram enviados e realiza o tratamento dele para inserir na base de dados
       - com map e possível percorre e saber quais arquivos foram enviados.
    */
    const upload = files.map(file => ({
      file,
      name: file.name,
      readableSize: filesize(file.size),
    }));

    /* Recebe o Uplodo dos aquivos realizados */
    setUploadedFiles(upload);

  }

  return (
    <>
      <Header size="small" />
      <Container>
        <Title>Importar uma transação</Title>
        <ImportFileContainer>
          <Upload onUpload={submitFile} />
           {/* Se existir um arquivo(s) que foram colocados para upload será listado em tela. */}
          {!!uploadedFiles.length && <FileList files={uploadedFiles} />}

          <Footer>
            <p>
              <img src={alert} alt="Alert" />
              Permitido apenas arquivos CSV
            </p>
               <button onClick={handleUpload} type="button">
              Enviar
            </button>
          </Footer>
        </ImportFileContainer>
      </Container>
    </>
  );
};

export default Import;
