const express = require('express');
const { uuid, isUuid } = require('uuidv4'); // gerar universal unique id, validar id

const app = express();

app.use(express.json()); // para o node(express) ler JSON -> precisa ser no incio da aplicação

const projects = []; // guardar temporariamente na memória da aplicação

// MIDDLEWARES:

// mostrar no console método, url e time
function logRequest(request, response, next) {
  const { method, url } = request;

  const logLabel = `[${method.toUpperCase()}] ${url}`;

  console.time(logLabel); // ex: /projects?title=React: 23.582ms

  next(); // próximo middleware (rotas)

  console.timeEnd(logLabel);
}

// verificar se o id é válido (isUuid)
function validateProjectId(request, response, next) {
  const { id } = request.params;

  if (!isUuid(id)) {
    return response.status(400).json({ error: 'Invalid project ID.' });
    // como tem o return, nada será executado posteriormente    
  }

  return next();
}

app.use(logRequest);
app.use('/projects/:id', validateProjectId); // aplicar apenas nas rotas com /:id (put/delete)

// GET -> listar informações
app.get('/projects', (request, response) => {
  const { title } = request.query;

  const results = title 
    ? projects.filter(project => project.title.includes(title)) // verifica se o título contém o título filtrado
    : projects; // se não filtrar por título, retorna todos os projects

  return response.json(results);
});

// POST -> criar informações
app.post('/projects', (request, response) => {
  const { title, owner } = request.body; // request body
  
  const project = { id: uuid(), title, owner }

  projects.push(project);

  return response.json(project);
});

// PUT -> atualizar um projeto
app.put('/projects/:id', (request, response) => {
  const { id } = request.params; // route params
  const { title, owner } = request.body;

  const projectIndex = projects.findIndex(project => project.id === id); //posicao do projeto 

  if (projectIndex < 0) {
    return response.status(400).json({ error: 'Project not found.'});
  }

  const project = {
    id,
    title,
    owner,
  };

  projects[projectIndex] = project;

  return response.json(project);  
});

// DELETE -> deletar um projeto
app.delete('/projects/:id', (request, response) => {
  const { id } = request.params; // route params

  const projectIndex = projects.findIndex(project => project.id === id); //posicao do projeto 

  if (projectIndex < 0) {
    return response.status(400).json({ error: 'Project not found.'});
  }

  projects.splice(projectIndex, 1); // retira do array a partir do index, 1 elemento

  return response.status(204).send();
});

app.listen(3333, () => {
  console.log('🚀Back-end started!');
});
