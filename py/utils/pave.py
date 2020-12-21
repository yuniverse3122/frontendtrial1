from abc import ABC, abstractmethod


class Model(ABC):
    def __init__(self):
        super().__init__()

    @abstractmethod
    def run(self):
        pass
