import "dotenv/config"
import mongoose, { Types } from "mongoose"

import bcrypt from "bcryptjs"


import getUserName from "./getUserName.js"
import { User } from "../data/index.js"
import { NotFoundError, ContentError } from "com/errors.js"

import { expect } from "chai"

const { MONGODB_URL_TEST } = process.env

const { ObjectId } = Types

debugger

describe('getUserName', () => {
    before(() => mongoose.connect(MONGODB_URL_TEST).then(() => User.deleteMany()))

    beforeEach(() => User.deleteMany())

    it('succeeds get userName from existing user', () =>
        bcrypt.hash('1234', 8)
            .then(hash => Promise.all([User.create({
                name: "ana",
                surname: "bana",
                email: "ana@bana.com",
                username: "banana",
                password: hash
            }), User.create({
                name: "Test",
                surname: "User",
                email: "test@user.com",
                username: "testuser",
                password: hash
            })]))
            .then(([user, targetUser]) => getUserName(user.id, targetUser.id))
            .then(name => {
                expect(name).to.be.a.string
                expect(name).to.equal("Test")
            })
    )

    it('fails on non-existing user', () => {
        let errorThrown

        return bcrypt.hash('1234', 8)
            .then(hash => User.create({
                name: "ana",
                surname: "bana",
                email: "ana@bana.com",
                username: "banana",
                password: hash
            }))
            .then(user => getUserName(new ObjectId().toString(), user.id))
            .catch(error => errorThrown = error)
            .finally(() => {
                expect(errorThrown).to.be.instanceOf(NotFoundError)
                expect(errorThrown.message).to.equal('❌ user not found')
            })
    })

    it('fails on non-existing user', () => {
        let errorThrown

        return bcrypt.hash('1234', 8)
            .then(hash => User.create({
                name: "ana",
                surname: "bana",
                email: "ana@bana.com",
                username: "banana",
                password: hash
            }))
            .then(targetUser => getUserName(targetUser.id, new ObjectId().toString()))
            .catch(error => errorThrown = error)
            .finally(() => {
                expect(errorThrown).to.be.instanceOf(NotFoundError)
                expect(errorThrown.message).to.equal('❌ targetUser not found')
            })
    })

    it("fails on invalid userId", () => {
        let errorThrown

        try {
            getUserName(12345, new ObjectId().toString())
        } catch (error) {
            errorThrown = error

        } finally {
            expect(errorThrown).to.be.instanceOf(ContentError)
            expect(errorThrown.message).to.equal("❌ userId is not valid")
        }
    })


    it("fails on invalid targetUserId", () => {
        let errorThrown

        try {
            getUserName(new ObjectId().toString(), 12345)
        } catch (error) {
            errorThrown = error

        } finally {
            expect(errorThrown).to.be.instanceOf(ContentError)
            expect(errorThrown.message).to.equal("❌ targetUserId is not valid")
        }
    })

    after(() => User.deleteMany().then(() => mongoose.disconnect()))
})