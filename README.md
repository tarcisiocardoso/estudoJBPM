# EstudoJBPM

POC e estudo da funcionalidade do JBPM usando as seguntes tecnologias

  - Spring
  - Jquery
  - Bootstrap

# Instalação

  - Ultima versão do JBPM (https://www.jbpm.org/)
  - Clone do projeto
  - Importar o projeto kjar para o Business Central
  - Configiruar o RESTWorkItemHandler no Business Central (Register Work Item Handler via deployment descriptor)

## Development
Executar a atualização do kjar:
```sh
mvn cleans istall
```

Executar o serviço:
```sh
mvn clean instal
```
ou:
```sh
./launch.sh
```

Ir para a pagina: http://localhost:8090/poc
