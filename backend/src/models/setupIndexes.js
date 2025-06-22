const mongoose = require('mongoose');

/**
 * Script para criar índices no MongoDB que ajudarão a otimizar as operações de order
 * Isso permite que o MongoDB use esses índices para sort, reduzindo o uso de memória
 */
async function setupIndexes() {
  try {
    console.log('Configurando índices para otimizar operações de sort...');
    
    await mongoose.connection.asPromise();
    
    const db = mongoose.connection;
    const moviesCollection = db.collection('movies');

    console.log('Criando índice para o campo title...');
    await moviesCollection.createIndex({ title: 1 });
    
    console.log('Criando índice para o campo year...');
    await moviesCollection.createIndex({ year: 1 }); 
    
    console.log('Criando índice para o campo imdb.rating...');
    await moviesCollection.createIndex({ 'imdb.rating': 1 });
    
    console.log('Criando índice composto para gêneros e título...');
    await moviesCollection.createIndex({ genres: 1, title: 1 });
    
    console.log('Criando índice composto para gêneros e ano...');
    await moviesCollection.createIndex({ genres: 1, year: 1 });
    
    console.log('Criando índice composto para gêneros e avaliação...');
    await moviesCollection.createIndex({ genres: 1, 'imdb.rating': 1 });

    console.log('Índices criados com sucesso.');
  } catch (error) {
    console.error('Erro ao configurar índices:', error);
  }
}

module.exports = setupIndexes;