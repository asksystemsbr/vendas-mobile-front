export interface Cliente {
    id?: number; // Mapeia ID do backend
    idSituacaoCliente?: number | null; // Alinhado com ID_SITUACAO_CLIENTE
    nome?: string; // Mapeia NOME
    fantasia?: string | null; // Mapeia FANTASIA
    email?: string | null; // Mapeia EMAIL
    cpfCnpj?: string | null; // Mapeia CPF_CNPJ
    rg?: string | null; // Mapeia RG
    orgaoRg?: string | null; // Mapeia ORGAO_RG
    inscricaoEstadual?: string | null; // Mapeia INSCRICAO_ESTADUAL
    inscricaoMunicipal?: string | null; // Mapeia INSCRICAO_MUNICIPAL
    tipoPessoa?: string | null; // Mapeia TIPO_PESSOA
    dataCadastro?: Date | string | null; // Mapeia DATA_CADASTRO
    dataEmissaoRg?: Date | string | null; // Mapeia DATA_EMISSAO_RG
    sexo?: string | null; // Mapeia SEXO
    logradouro?: string | null; // Mapeia LOGRADOURO
    numero?: string | null; // Mapeia NUMERO
    complemento?: string | null; // Mapeia COMPLEMENTO
    cep?: string | null; // Mapeia CEP
    bairro?: string | null; // Mapeia BAIRRO
    cidade?: string | null; // Mapeia CIDADE
    uf?: string | null; // Mapeia UF
    foneOne?: string | null; // Mapeia FONE1
    foneTwo?: string | null; // Mapeia FONE2
    celular?: string | null; // Mapeia CELULAR
    contato?: string | null; // Mapeia CONTATO
    codigoIbgeCidade?: number | null; // Mapeia CODIGO_IBGE_CIDADE
    codigoIbgeUf?: number | null; // Mapeia CODIGO_IBGE_UF
    dataUltimaCompra?: Date | string | null; // Mapeia DATA_ULTIMA_COMPRA
    ultimaNfe?: string | null; // Mapeia ULTIMANFE
    ultimaOs?: string | null; // Mapeia ULTIMAOS
    placa?: string | null; // Mapeia PLACA
    mensalista?: string | null; // Mapeia MENSALISTA
    conveniado?: string | null; // Mapeia CONVENIADO
    desconto1Hora?: string | null; // Mapeia DESCONTO1HORA
    desconto2Hora?: string | null; // Mapeia DESCONTO2HORA
    turno?: string | null; // Mapeia TURNO
    pontos?: string | null; // Mapeia PONTOS
    valorFixo?: number; // Mapeia VALOR_FIXO
    formaPgto?: string | null; // Mapeia FORMA_PGTO
    diasPgto?: string | null; // Mapeia DIAS_PGTO
    funcionarioId?: number | null; // Mapeia FUNCIONARIO_ID
    limiteSaldo?: number; // Mapeia LIMITE_SALDO
    observacao?: string | null; // Mapeia OBS
    dataNascimento?: Date | string | null; // Mapeia DATA_NASCIMENTO
    usuario?: string | null; // Mapeia OBS
    senha?: string | null; // Mapeia OBS
  }  