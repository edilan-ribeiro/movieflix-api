import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const genreHomeController = async (_req: Request, res:Response) => {
    try {
        const allGenres = await prisma.genre.findMany({
            orderBy: {
                id: "asc"
            }
        });
        res.json(allGenres);

    } catch (error) {
        return res.status(500).send({message: "Ocorreu um erro ao buscar os dados dos filmes"});
    }
};

export const genreByIdController = async (req: Request, res:Response) => {
    const genreId = Number(req.params.id);

    try {
        const genres = await prisma.genre.findUnique({
            where: {
                id: genreId
            }
        });

        if (!genres) {
            return res.status(404).send({message: "Gênero não encontrado"});
        }

        const data = req.body;

        await prisma.genre.update({
            where:{
                id: genreId
            },
            data
        });
        
    } catch (error) {
        return res.status(500).send({message: "Falha ao tentar a atualizar os dados deste gênero!"});
    }

    return res.status(200).send({message: "Gênero atualizado com sucesso!"});
};

export const genreCreateController = async (req: Request, res:Response) => {
    const {name} = req.body;

    if(!name) {
        return res.status(400).send({ message: "O nome do gênero é obrigatório." });
    }

    try {
        const genreAlreadyInDatabase = await prisma.genre.findFirst({
            where: {
                name: {
                    equals: name,
                    mode: "insensitive"
                }
            }
        });

        if (genreAlreadyInDatabase) {
            return res.status(409).send({message: `O gênero ${name} já esta cadastrado na base de dados`});
        }

        await prisma.genre.create({
            data: {
                name: name
            }
        });

    } catch (error) {
        return res.status(500).send({message: "Falha ao tentar adicionar os dados deste gênero!"});
    }

    return res.status(200).send({message: "Gênero adicionado com sucesso!"});
};

export const genreDeleteController = async (req: Request, res:Response) => {
    const genreId = Number(req.params.id);

    try {
        const genre = await prisma.genre.findUnique({
            where: {
                id: genreId,
            }
        });

        if(!genre){
            return res.status(404).send({message: "Gênero não encontrado"});
        }

        await prisma.genre.delete({
            where: {
                id: genreId
            }
        });
    } catch (error) {
        return res.status(500).send("Falha ao remover o gênero desejado");
    }

    res.status(200).send({message: "Gênero removido com sucesso." });
};