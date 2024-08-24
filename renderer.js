let selectedDirectory;

const directoryScreen = document.getElementById('directory-selection');
const mainScreen = document.getElementById('main-screen');
const selectDirectoryBtn = document.getElementById('select-directory');
const updateDirectoryBtn = document.getElementById('update-directory');
const backToDirectoryBtn = document.getElementById('back-to-directory');
const submitBtn = document.getElementById('submit');
const sendMessagesBtn = document.createElement('button');
const directoryInput = document.getElementById('directory')
const nextButton = document.getElementById('next')
sendMessagesBtn.textContent = 'Enviar mensagens';
sendMessagesBtn.style.display = 'none';
mainScreen.appendChild(sendMessagesBtn);

function showMainScreen() {
  directoryScreen.style.display = 'none';
  mainScreen.style.display = 'block';
}

function showDirectoryScreen() {
  mainScreen.style.display = 'none';
  directoryScreen.style.display = 'block';
}

function showSendMessagesButton() {
  document.getElementById('message').style.display = 'none';
  document.getElementById('csv-upload').style.display = 'none';
  document.getElementById('media-upload').style.display = 'none';
  Array.from(document.getElementsByTagName('label')).forEach(element => {
    element.style.display = 'none'
  });
  submitBtn.style.display = 'none';
  sendMessagesBtn.style.display = 'block';
}

async function init() {
  selectedDirectory = await window.electronAPI.getStoreValue('selectedDirectory');
  if (selectedDirectory) {
    directoryInput.value = selectedDirectory
    nextButton.style.display = 'inline-block'
    updateDirectoryBtn.style.display = 'inline-block';
  }
}

nextButton.addEventListener('click', showMainScreen)

selectDirectoryBtn.addEventListener('click', async () => {
  const directory = await window.electronAPI.selectDirectory();
  if (directory) {
    const isValid = await window.electronAPI.validateNodeProject(directory);
    if (isValid) {
      selectedDirectory = directory;
      await window.electronAPI.setStoreValue('selectedDirectory', selectedDirectory);
      updateDirectoryBtn.style.display = 'inline-block';
      showMainScreen();
    } else {
      alert('O diretório selecionado não é um projeto Node válido.');
    }
  }
});

updateDirectoryBtn.addEventListener('click', async () => {
  try {
    const result = await window.electronAPI.gitPull(selectedDirectory);
    alert(`Atualização feita com sucesso: ${result}`);
  } catch (error) {
    alert(`Erro ao atualizar: ${error.message}`);
  }
});

backToDirectoryBtn.addEventListener('click', showDirectoryScreen);

submitBtn.addEventListener('click', async () => {
  const message = document.getElementById('message').value;
  const csvFile = document.getElementById('csv-upload').files[0];
  const mediaFiles = Array.from(document.getElementById('media-upload').files);

  if (!message || !csvFile || mediaFiles.length === 0 || mediaFiles.length > 5) {
    alert('Por favor, preencha todos os campos corretamente.');
    return;
  }

  try {
    const csvBuffer = await csvFile.arrayBuffer();
    const mediaFilesData = await Promise.all(mediaFiles.map(async (file) => ({
      name: file.name,
      data: await file.arrayBuffer()
    })));

    await window.electronAPI.saveFiles(selectedDirectory, message, csvBuffer, mediaFilesData);
    alert('Arquivos salvos com sucesso!');
    showSendMessagesButton();
  } catch (error) {
    alert(`Erro ao salvar arquivos: ${error.message}`);
  }
});

sendMessagesBtn.addEventListener('click', async () => {
  try {
    await window.electronAPI.runNpmStart(selectedDirectory);
    alert('Comando npm start executado com sucesso!');
  } catch (error) {
    alert(`Erro ao executar npm start: ${error.message}`);
  }
});

init();