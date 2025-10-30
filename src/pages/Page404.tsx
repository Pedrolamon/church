import React from 'react';
// Se estiver usando o React Router DOM, descomente a linha abaixo para usar o Link
import { Link } from 'react-router-dom';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
            <div className="text-center space-y-8">
                {/* Título Principal de Destaque */}
                <h1 className="text-9xl font-extrabold text-indigo-500 tracking-widest">
                    404
                </h1>

                {/* Subtítulo e Mensagem */}
                <div className="bg-gray-800 px-4 py-2 text-sm text-gray-300 rounded rotate-1 shadow-lg">
                    <p className="font-semibold">Oops! Página Não Encontrada</p>
                </div>
                
                <p className="text-xl text-gray-400 mt-4">
                    Parece que você se aventurou em um território digital desconhecido.
                </p>

                {/* Botão de Retorno (use 'a' ou o componente Link do seu router) */}
                
                 <Link
                    to="/"
                    className="mt-8 inline-block px-8 py-3 text-sm font-medium text-white bg-indigo-600 border border-indigo-600 rounded-full hover:bg-indigo-700 active:text-indigo-500 focus:outline-none focus:ring transition duration-150 ease-in-out transform hover:scale-105 shadow-xl"
                >
                    Voltar para a Página Inicial
                </Link>
            </div>
        </div>
    );
}