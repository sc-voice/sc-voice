**A pesquisa por voz do SuttaCentral inclui apenas textos suportados.**

A instrução mais simples para usar a pesquisa é "basta digitar o que você deseja". Quando isso não for mais suficiente, este documento poderá ajudar.

### Compreendendo a pesquisa
A pesquisa por voz do SuttaCentral compreende diferentes estratégias de pesquisa, priorizadas da seguinte forma:

1. **Pesquisa por Sutta:** se você digitar o acrônimo do sutta, ele será retornado. Por exemplo, "mn1" retornará "MN 1".
1. **Pesquisa por frase:** se você digitar um texto que não seja um acrônimo para sutta, esse texto será usado para uma pesquisa de frase literal. Por exemplo, "azul, amarelo", "raiz do sofrimento".
1. **Pesquisa por palavra-chave:** se uma pesquisa literal não for bem-sucedida, o texto da pesquisa será dividido em "palavras", separadas por espaços. Suttas com TODAS as palavras serão mostrados. Por exemplo, não há suttas com as frases "amarelo azul" ou "qual é a raiz do sofrimento". O texto nesses exemplos não pode ser encontrado literalmente, mas há suttas que possuem "azul" e "amarelo". Existem também suttas contendo todas as palavras: "o que", "é", "a", "raiz", "de" e "sofrimento". Como as palavras encontradas podem estar em qualquer lugar do sutta, a pesquisa por palavra-chave geralmente retorna suttas não relacionados ao tópico de pesquisa desejado.

Como existem várias estratégias de pesquisa, o que você digita afeta os resultados da pesquisa. A pesquisa por sutta é mais rápida e a pesquisa por palavra-chave é a mais lenta (porque as outras duas estratégias de pesquisa foram tentadas e falharam). A pesquisa de frases é cirurgicamente precisa, enquanto a pesquisa de palavras-chave geralmente é útil na sua interpretação do que é relevante.

#### Pesquisa por Sutta
Os suttas são identificados exclusivamente pela combinação de _sutta_uid, idioma e tradutor_. Por exemplo, a seguir, são designações para diferentes documentos:

* `mn1/en/sujato` é a tradução inglesa do MN1 por Bhikkhu Sujato
* `mn1/en/bodhi` é a tradução inglesa do MN1 por Bhikkhu Bodhi

A notação acima é uma convenção do SuttaCentral que é conveniente por sua concisão. Você também pode usar abreviações comumente aceitas com espaços e letras maiúsculas alternativas:

* `MN 1/en/sujato`
* `MN 1/en/bodhi`
* `Sn 1.1/en/sujato`

O idioma e o nome do tradutor podem ser omitidos. O idioma padrão é o inglês (ou seja, 'en'). O tradutor padrão é deduzido da primeira tradução suportada (consulte a Política de suporte). Uma tradução herdada só é retornada se não houver tradução suportada e pode conter declarações erradas ou erros de ortografia.


O endereço de um Sutta no SuttaCentral às vezes combinam vários suttas curtos em um único documento. Você pode inserir o sutta específico diretamente por número ou usar todo o intervalo:

* `AN 1.1-10` retorna a página que contém os suttas AN 1.1 ... AN 1.10
* `AN 1.2` também retorna a página que contém os suttas AN 1.1 ... AN 1.10
* `an1.2` também retorna a página que contém os suttas AN 1.1 ... AN 1.10

Você também pode inserir uma lista de suttas para uma lista de reprodução. Quando vários suttas são retornados, eles normalmente são mostrados em ordem alfabética. No entanto, nesse caso, os suttas retornados serão solicitados conforme solicitado:

* `MN1, SN2.3, AN1.1`

#### Pesquisa por texto em Pali
Ao inserir texto no idioma Pali na caixa de pesquisa, as marcas diacríticas não importam para o resultado da pesquisa. No entanto, o número e a ordem das letras precisam estar corretos.

#### Relevância na pontuação
Os resultados da pesquisa são priorizados em ordem decrescente por pontuação de relevância. A relevância é calculada com base em:

* *C*: Quanto mais correspondências, mais relevância. Será 1 ou superior para um sutta correspondente.
* *F*: A fração dos segmentos de conversão correspondentes. Um sutta curto com algumas correspondências é mais relevante que um sutta maior com o mesmo número de correspondências. Esse número sempre será menor que 1.

A pontuação de relevância é simplesmente **C+F**. Por exemplo, um sutta de 100 segmentos com 2 segmentos correspondentes teria uma pontuação de relevância de:

```
2 + 2/100 = 2 + 0,02 = 2,02
``` 

NOTA: Os segmentos são as menores unidades de texto, como uma única frase, frase ou parágrafo curto estruturado de acordo com as unidades semânticas no texto raiz (Pali).  (Veja [Tecnologia de segmentação](/sc-voice/en/201-segmentation))

#### Expressões regulares (regex)
Muitas pessoas no SuttaCentral têm usado o `grep` para pesquisa. 
O programa `grep` é muito poderoso e suporta a capacidade de combinar [expressões regulares](https://www.google.com/search?q=grep+-E+option). O SuttaCentral Voice suporta expressões regulares grep (por exemplo, `root.*Sofrimento`).

#### Ortografia alternativa
As pesquisas por palavras-chave são normalmente restritivas, pois todas as palavras-chave devem estar presentes para que um sutta se qualifique como resultado da pesquisa. Às vezes, porém, é preciso procurar todas as grafias alternativas. Por exemplo, a pesquisa por "bodhisattva" e a pesquisa por "bodhisatta" retornam resultados, mas a pesquisa por "bodhisattva bodhisatta" não retorna nada porque nenhum sutta usa as duas grafias.

Para procurar todas as grafias alternativas, use a barra vertical "|" separar os suplentes. Por exemplo, procurar "bodhisattva|bodhisatta" retorna todos os suttas com qualquer ortografia.

#### Número de resultados da pesquisa
O número de resultados da pesquisa é restrito inicialmente a 5. A limitação dos resultados da pesquisa fornece algo útil rapidamente. Se você precisar de mais resultados de pesquisa, basta alterar o máximo em 
_Configurações: Buscar resultados_

#### Listas de reprodução de Sutta
![download link](https://github.com/sc-voice/sc-voice/blob/master/src/assets/play-all-de.png?raw=true)

Você pode ouvir os suttas listados nos resultados da pesquisa. Basta clicar em "Reproduzir" diretamente abaixo do resumo do resultado.

### Perguntas frequentes
##### Por que meus resultados são diferentes da pesquisa SuttaCentral.net?
A ferramenta de busca do SuttaCentral Voice é diferente da pesquisa em SuttaCentral.net. Por design, a pesquisa do SuttaCentral Voice mostra apenas suttas com maior pontuação de relevância e não mostra todos os resultados mostrados pela pesquisa em SuttaCentral.net. Diferentemente do SuttaCentral.net, a pesquisa por voz do SuttaCentral não retorna resultados de fora dos quatro principais nikayas do cânone Pali e das primeiras partes do Khuddaka Nikaya. (Os textos Vinaya serão incluídos assim que estiverem disponíveis em formato segmentado.) Como a varredura visual dos resultados da pesquisa é difícil ou impossível para o usuário assistido, o design prioriza o utilitário simples em detrimento de resultados exaustivos para evitar sobrecarregar o usuário.

##### Por que não consigo encontrar o termo de pesquisa em um dos meus resultados de pesquisa?
O SuttaCentral Voice pesquisa texto de sutta e texto de anotação (ou seja, "sinopse") anexado ao sutta. Por exemplo, procurar "estudo" retorna SN55.53, que possui "estudo" apenas na anotação editorial.
