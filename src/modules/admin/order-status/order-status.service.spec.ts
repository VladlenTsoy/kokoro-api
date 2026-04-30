import {NotFoundException} from "@nestjs/common"
import {OrderStatusService} from "./order-status.service"

describe("OrderStatusService transitions", () => {
    const buildService = () => {
        const statusRepository = {
            findOneBy: jest.fn(),
            find: jest.fn()
        }
        const deleteQuery = {
            delete: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            execute: jest.fn()
        }
        const transitionRepository = {
            find: jest.fn(),
            create: jest.fn((value) => value),
            save: jest.fn(),
            createQueryBuilder: jest.fn(() => deleteQuery)
        }

        return {
            service: new OrderStatusService(statusRepository as any, transitionRepository as any),
            statusRepository,
            transitionRepository,
            deleteQuery
        }
    }

    it("replaces allowed transitions atomically for a status", async () => {
        const {service, statusRepository, transitionRepository, deleteQuery} = buildService()
        const fromStatus = {id: 1, title: "new"}
        const toStatuses = [
            {id: 2, title: "confirmed"},
            {id: 3, title: "cancelled"}
        ]
        statusRepository.findOneBy.mockResolvedValue(fromStatus)
        statusRepository.find.mockResolvedValue(toStatuses)
        transitionRepository.save.mockResolvedValue([])
        transitionRepository.find.mockResolvedValue([{id: 10}])

        const result = await service.setTransitions(1, {toStatusIds: [2, 3]})

        expect(deleteQuery.where).toHaveBeenCalledWith("fromStatusId = :id", {id: 1})
        expect(transitionRepository.create).toHaveBeenCalledTimes(2)
        expect(transitionRepository.save).toHaveBeenCalledWith([
            {fromStatus, toStatus: toStatuses[0], isActive: true},
            {fromStatus, toStatus: toStatuses[1], isActive: true}
        ])
        expect(result).toEqual([{id: 10}])
    })

    it("throws when setting transitions for missing status", async () => {
        const {service, statusRepository, transitionRepository} = buildService()
        statusRepository.findOneBy.mockResolvedValue(null)

        await expect(service.setTransitions(404, {toStatusIds: [1]})).rejects.toBeInstanceOf(NotFoundException)
        expect(transitionRepository.save).not.toHaveBeenCalled()
    })
})
