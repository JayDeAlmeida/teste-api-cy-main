/// <reference types="cypress" />
import { expect } from "chai";
import usuarioSchema from "../contracts/usuarios.contract";

describe('Testes da Funcionalidade Usuários', () => {

     let token

     before(() => {
          cy.token('fulano@qa.com', 'teste').then(tkn => { token = tkn })
     });

     it('Deve validar contrato de usuários', () => {
          cy.request('usuarios').then(response => {
               return usuarioSchema.validateAsync(response.body)
          })
     });

     it('Deve listar usuários cadastrados', () => {
          cy.request('usuarios').then(response => {
               expect(response.body).to.have.property('quantidade')
               expect(response.status).to.equal(200)
          })
     });

     it('Deve cadastrar um usuário com sucesso', () => {
          let nome = `Usuario random ${Math.floor(Math.random() * 1000)}`
          let email = `usuario${Math.floor(Math.random() * 1000)}@email.com`
          cy.request({
               method: 'POST',
               url: 'usuarios',
               headers: { authorization: token },
               body: {

                    "nome": nome,
                    "email": email,
                    "password": "teste",
                    "administrador": "false"

               }
          }).then(response => {
               expect(response.body.message).to.equal('Cadastro realizado com sucesso')
          })
     });

     it('Deve validar um usuário com email inválido', () => {
          let nome = `Usuario random ${Math.floor(Math.random() * 100)}`
          let email = `usuario${Math.floor(Math.random() * 100)}email.com`
          cy.request({
               failOnStatusCode: false,
               method: 'POST',
               url: 'usuarios',
               headers: { authorization: token },
               body: {

                    "nome": nome,
                    "email": email,
                    "password": "teste",
                    "administrador": "false"

               }
          }).then(response => {
               expect(response.body.email).to.equal('email deve ser um email válido')
               expect(response.status).to.equal(400)
          })
     });

     it('Deve editar um usuário previamente cadastrado', () => {
          let nome = `Usuario random ${Math.floor(Math.random() * 100)}`
          let email = `usuario${Math.floor(Math.random() * 1000)}@email.com`
          let email2 = `usuario${Math.floor(Math.random() * 1000)}@email.com`
          cy.cadastrarUsuario(token, nome, email).then(response => {
               let id = response.body._id
               cy.request({
                    method: 'PUT',
                    url: `usuarios/${id}`,
                    headers: { authorization: token },
                    body: {
                         "nome": nome,
                         "email": email2,
                         "password": "teste",
                         "administrador": "false"
                    }
               })
          }).then(response => {
               expect(response.body.message).to.equal('Registro alterado com sucesso')
               expect(response.status).to.equal(200)
          });
     });

     it('Deve deletar um usuário previamente cadastrado', () => {
          let nome = `Usuario random ${Math.floor(Math.random() * 100)}`
          let email = `usuario${Math.floor(Math.random() * 1000)}@email.com`
          cy.cadastrarUsuario(token, nome, email).then(response => {
               let id = response.body._id
               cy.request({
                    method: 'DELETE',
                    headers: { authorization: token },
                    url: `usuarios/${id}`
               }).then(response => {
                    expect(response.body.message).to.equal('Registro excluído com sucesso')
                    expect(response.status).to.equal(200)
               })
          })
     });


});
